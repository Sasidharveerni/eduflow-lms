from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pymongo import MongoClient
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from bson.binary import Binary
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
import io
import os
from dotenv import load_dotenv
import hashlib

app = FastAPI(title="EduFlow LMS API", version="1.0.0")

load_dotenv()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI")  # Replace with your MongoDB URI
client = MongoClient(MONGO_URI)
db = client["eduflow_lms"]
users_collection = db["users"]
courses_collection = db["courses"]
progress_collection = db["progress"]
pdfs_collection = db["pdfs"]

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "student" or "teacher"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

class ModuleCreate(BaseModel):
    title: str

class LessonCreate(BaseModel):
    title: str
    youtubeUrl: str
    order: int

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    youtubeUrl: Optional[str] = None
    pdfFileId: Optional[str] = None
    order: Optional[int] = None

class CourseCreate(BaseModel):
    title: str
    description: str
    teacherId: str

class ModuleAdd(BaseModel):
    title: str

class ProgressUpdate(BaseModel):
    studentId: str
    courseId: str
    lessonId: str
    completed: bool

# Helper Functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc
    return None

def hash_password(password: str) -> str:
    """Simple password hashing - use bcrypt in production"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password"""
    return hash_password(password) == hashed

def ensure_course_content_ids(course):
    """Ensure embedded modules and lessons have stable ids."""
    if not course:
        return course

    modules = course.get("modules", [])
    changed = False

    for module in modules:
        if not module.get("id"):
            module["id"] = str(ObjectId())
            changed = True

        for lesson in module.get("lessons", []):
            if not lesson.get("id"):
                lesson["id"] = str(ObjectId())
                changed = True

    if changed and course.get("_id"):
        courses_collection.update_one(
            {"_id": course["_id"]},
            {"$set": {"modules": modules}}
        )

    return course

def find_lesson_location(lesson_id: str):
    """Locate a lesson inside embedded course modules."""
    courses = list(courses_collection.find({}))

    for course in courses:
        course = ensure_course_content_ids(course)
        modules = course.get("modules", [])

        for module_index, module in enumerate(modules):
            lessons = module.get("lessons", [])
            for lesson_index, lesson in enumerate(lessons):
                if lesson.get("id") == lesson_id:
                    return course, module_index, lesson_index, lesson

    return None, None, None, None

def recalculate_course_progress(course_id: str):
    """Recompute progress percentages after lesson structure changes."""
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        return

    total_lessons = 0
    for module in course.get("modules", []):
        total_lessons += len(module.get("lessons", []))

    progress_records = list(progress_collection.find({"courseId": course_id}))
    for record in progress_records:
        completed_lessons = record.get("completedLessons", [])
        progress_percent = (len(completed_lessons) / total_lessons * 100) if total_lessons > 0 else 0
        progress_collection.update_one(
            {"_id": record["_id"]},
            {
                "$set": {
                    "progressPercent": progress_percent,
                    "updated_at": datetime.utcnow()
                }
            }
        )

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_dict = user.dict()
    user_dict["password"] = hash_password(user_dict["password"])
    user_dict["created_at"] = datetime.utcnow()
    
    result = users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    return serialize_doc(user_dict)

@app.post("/api/auth/login")
async def login(user: UserLogin):
    """Login user"""
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Return user info (in production, return JWT token)
    return {
        "id": str(db_user["_id"]),
        "name": db_user["name"],
        "email": db_user["email"],
        "role": db_user["role"]
    }

# ==================== COURSE ENDPOINTS ====================

@app.post("/api/courses", status_code=status.HTTP_201_CREATED)
async def create_course(course: CourseCreate):
    """Create a new course"""
    # Verify teacher exists
    teacher = users_collection.find_one({"_id": ObjectId(course.teacherId), "role": "teacher"})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    course_dict = course.dict()
    course_dict["modules"] = []
    course_dict["created_at"] = datetime.utcnow()
    
    result = courses_collection.insert_one(course_dict)
    course_dict["_id"] = result.inserted_id
    
    return serialize_doc(course_dict)

@app.get("/api/courses")
async def get_courses(teacherId: Optional[str] = None):
    """Get all courses or filter by teacher"""
    query = {}
    if teacherId:
        query["teacherId"] = teacherId
    
    courses = list(courses_collection.find(query))
    for course in courses:
        course = ensure_course_content_ids(course)
        # Add teacher name
        teacher = users_collection.find_one({"_id": ObjectId(course["teacherId"])})
        course["teacher_name"] = teacher["name"] if teacher else "Unknown"
        course["id"] = str(course["_id"])
        del course["_id"]
        
        # Count total lessons
        total_lessons = 0
        for module in course.get("modules", []):
            total_lessons += len(module.get("lessons", []))
        course["total_lessons"] = total_lessons
    
    return courses

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    """Get course details by ID"""
    try:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        course = ensure_course_content_ids(course)
        
        # Add teacher name
        teacher = users_collection.find_one({"_id": ObjectId(course["teacherId"])})
        course["teacher_name"] = teacher["name"] if teacher else "Unknown"
        
        return serialize_doc(course)
    except:
        raise HTTPException(status_code=400, detail="Invalid course ID")

@app.put("/api/courses/{course_id}")
async def update_course(course_id: str, course: CourseCreate):
    """Update course details"""
    try:
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": course.dict()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course updated successfully"}
    except:
        raise HTTPException(status_code=400, detail="Invalid course ID")

@app.delete("/api/courses/{course_id}")
async def delete_course(course_id: str):
    """Delete a course"""
    try:
        result = courses_collection.delete_one({"_id": ObjectId(course_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Delete all progress records for this course
        progress_collection.delete_many({"courseId": course_id})
        
        return {"message": "Course deleted successfully"}
    except:
        raise HTTPException(status_code=400, detail="Invalid course ID")

# ==================== MODULE ENDPOINTS ====================

@app.post("/api/courses/{course_id}/modules")
async def add_module(course_id: str, module: ModuleAdd):
    """Add a module to a course"""
    try:
        new_module = {
            "id": str(ObjectId()),
            "title": module.title,
            "lessons": [],
            "created_at": datetime.utcnow()
        }
        
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$push": {"modules": new_module}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return {"message": "Module added successfully", "module": new_module}
    except:
        raise HTTPException(status_code=400, detail="Invalid course ID")

@app.put("/api/courses/{course_id}/modules/{module_index}")
async def update_module(course_id: str, module_index: int, module: ModuleAdd):
    """Update a module"""
    try:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        if module_index >= len(course["modules"]):
            raise HTTPException(status_code=404, detail="Module not found")
        
        update_path = f"modules.{module_index}.title"
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": {update_path: module.title}}
        )
        
        return {"message": "Module updated successfully"}
    except:
        raise HTTPException(status_code=400, detail="Invalid request")

@app.delete("/api/courses/{course_id}/modules/{module_index}")
async def delete_module(course_id: str, module_index: int):
    """Delete a module"""
    try:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        if module_index >= len(course["modules"]):
            raise HTTPException(status_code=404, detail="Module not found")
        
        # Remove module by index
        modules = course["modules"]
        modules.pop(module_index)
        
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": {"modules": modules}}
        )
        
        return {"message": "Module deleted successfully"}
    except:
        raise HTTPException(status_code=400, detail="Invalid request")

# ==================== LESSON ENDPOINTS ====================

@app.post("/api/courses/{course_id}/modules/{module_index}/lessons")
async def add_lesson(
    course_id: str,
    module_index: int,
    title: str = Form(...),
    youtubeUrl: str = Form(...),
    order: int = Form(...),
    pdfFileId: Optional[str] = Form(None),
    pdf: Optional[UploadFile] = File(None)
):
    """Add a lesson to a module"""
    try:
        # Get course
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        course = ensure_course_content_ids(course)
        
        if module_index >= len(course["modules"]):
            raise HTTPException(status_code=404, detail="Module not found")
        
        # Handle PDF upload if provided
        pdf_file_id = pdfFileId
        if pdf:
            pdf_content = await pdf.read()
            pdf_doc = {
                "filename": pdf.filename,
                "content_type": pdf.content_type,
                "data": Binary(pdf_content),
                "uploaded_at": datetime.utcnow()
            }
            result = pdfs_collection.insert_one(pdf_doc)
            pdf_file_id = str(result.inserted_id)
        
        # Create lesson
        new_lesson = {
            "id": str(ObjectId()),
            "title": title,
            "youtubeUrl": youtubeUrl,
            "order": order,
            "pdfFileId": pdf_file_id,
            "created_at": datetime.utcnow()
        }
        
        # Add lesson to module
        update_path = f"modules.{module_index}.lessons"
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$push": {update_path: new_lesson}}
        )
        
        return {"message": "Lesson added successfully", "lesson": new_lesson}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, lesson: LessonUpdate):
    """Update a lesson by locating its parent course and module."""
    try:
        course, module_index, lesson_index, existing_lesson = find_lesson_location(lesson_id)
        if not course:
            raise HTTPException(status_code=404, detail="Lesson not found")

        update_data = lesson.model_dump(exclude_unset=True) if hasattr(lesson, "model_dump") else lesson.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No lesson fields provided")

        lessons = course["modules"][module_index]["lessons"]
        lessons[lesson_index].update(update_data)

        update_path = f"modules.{module_index}.lessons"
        courses_collection.update_one(
            {"_id": course["_id"]},
            {"$set": {update_path: lessons}}
        )

        recalculate_course_progress(str(course["_id"]))
        return {"message": "Lesson updated successfully", "lesson": lessons[lesson_index]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str):
    """Delete a lesson by locating its parent course and module."""
    try:
        course, module_index, lesson_index, _ = find_lesson_location(lesson_id)
        if not course:
            raise HTTPException(status_code=404, detail="Lesson not found")

        lessons = course["modules"][module_index]["lessons"]
        lessons.pop(lesson_index)

        update_path = f"modules.{module_index}.lessons"
        courses_collection.update_one(
            {"_id": course["_id"]},
            {"$set": {update_path: lessons}}
        )

        progress_collection.update_many(
            {"courseId": str(course["_id"])},
            {"$pull": {"completedLessons": lesson_id}}
        )
        recalculate_course_progress(str(course["_id"]))

        return {"message": "Lesson deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== PDF ENDPOINTS ====================

@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload PDF file to MongoDB"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        pdf_content = await file.read()
        pdf_doc = {
            "filename": file.filename,
            "content_type": file.content_type,
            "data": Binary(pdf_content),
            "size": len(pdf_content),
            "uploaded_at": datetime.utcnow()
        }
        
        result = pdfs_collection.insert_one(pdf_doc)
        return {
            "fileId": str(result.inserted_id),
            "filename": file.filename,
            "size": len(pdf_content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(e)}")

@app.get("/api/pdf/{file_id}")
async def get_pdf(file_id: str):
    """Retrieve PDF file from MongoDB"""
    try:
        pdf_doc = pdfs_collection.find_one({"_id": ObjectId(file_id)})
        if not pdf_doc:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        pdf_data = pdf_doc["data"]
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_data),
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename={pdf_doc['filename']}"}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid file ID")

# ==================== PROGRESS ENDPOINTS ====================

@app.post("/api/progress/update")
async def update_progress(progress: ProgressUpdate):
    """Update student progress for a lesson"""
    try:
        if not progress.lessonId:
            raise HTTPException(status_code=400, detail="Lesson ID is required")

        # Check if progress record exists
        progress_record = progress_collection.find_one({
            "studentId": progress.studentId,
            "courseId": progress.courseId
        })
        
        if progress_record:
            # Update existing record
            completed_lessons = progress_record.get("completedLessons", [])
            
            if progress.completed:
                if progress.lessonId not in completed_lessons:
                    completed_lessons.append(progress.lessonId)
            else:
                if progress.lessonId in completed_lessons:
                    completed_lessons.remove(progress.lessonId)
            
            # Calculate progress percentage
            # Get total lessons in course
            course = courses_collection.find_one({"_id": ObjectId(progress.courseId)})
            total_lessons = 0
            for module in course.get("modules", []):
                total_lessons += len(module.get("lessons", []))
            
            progress_percent = (len(completed_lessons) / total_lessons * 100) if total_lessons > 0 else 0
            
            result = progress_collection.update_one(
                {"_id": progress_record["_id"]},
                {
                    "$set": {
                        "completedLessons": completed_lessons,
                        "progressPercent": progress_percent,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        else:
            # Create new progress record
            course = courses_collection.find_one({"_id": ObjectId(progress.courseId)})
            total_lessons = 0
            for module in course.get("modules", []):
                total_lessons += len(module.get("lessons", []))
            
            completed_lessons = [progress.lessonId] if progress.completed else []
            progress_percent = (len(completed_lessons) / total_lessons * 100) if total_lessons > 0 else 0
            
            new_progress = {
                "studentId": progress.studentId,
                "courseId": progress.courseId,
                "completedLessons": completed_lessons,
                "progressPercent": progress_percent,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = progress_collection.insert_one(new_progress)
        
        return {"message": "Progress updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/progress/student/{student_id}")
async def get_all_student_progress(student_id: str):
    """Get all progress records for a student"""
    try:
        progress_records = list(progress_collection.find({"studentId": student_id}))
        for record in progress_records:
            record["id"] = str(record["_id"])
            del record["_id"]
        
        return progress_records
    except:
        raise HTTPException(status_code=400, detail="Invalid student ID")

@app.get("/api/progress/course/{course_id}/students")
async def get_course_progress(course_id: str):
    """Get all student progress for a course (for teachers)"""
    try:
        progress_records = list(progress_collection.find({"courseId": course_id}))
        
        # Add student details
        for record in progress_records:
            record["id"] = str(record["_id"])
            del record["_id"]
            
            student = users_collection.find_one({"_id": ObjectId(record["studentId"])})
            if student:
                record["student_name"] = student["name"]
                record["student_email"] = student["email"]
        
        return progress_records
    except:
        raise HTTPException(status_code=400, detail="Invalid course ID")

@app.get("/api/progress/{student_id}/{course_id}")
async def get_progress(student_id: str, course_id: str):
    """Get student progress for a specific course"""
    try:
        progress = progress_collection.find_one({
            "studentId": student_id,
            "courseId": course_id
        })
        
        if progress:
            return {
                "studentId": progress["studentId"],
                "courseId": progress["courseId"],
                "completedLessons": progress["completedLessons"],
                "progressPercent": progress["progressPercent"],
                "enrolled": True
            }
        else:
            return {
                "studentId": student_id,
                "courseId": course_id,
                "completedLessons": [],
                "progressPercent": 0,
                "enrolled": False
            }
    except:
        raise HTTPException(status_code=400, detail="Invalid parameters")

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard/student/{student_id}")
async def get_student_dashboard(student_id: str):
    """Get student dashboard data"""
    try:
        # Get all progress records for student
        progress_records = list(progress_collection.find({"studentId": student_id}))
        
        enrolled_courses = []
        for progress in progress_records:
            course = courses_collection.find_one({"_id": ObjectId(progress["courseId"])})
            if course:
                course = ensure_course_content_ids(course)
                # Get last opened lesson (simplified - would need tracking)
                last_lesson = None
                if progress["completedLessons"]:
                    last_lesson = progress["completedLessons"][-1]
                
                enrolled_courses.append({
                    "id": str(course["_id"]),
                    "courseId": str(course["_id"]),
                    "title": course["title"],
                    "description": course["description"],
                    "progressPercent": progress["progressPercent"],
                    "lastOpenedLesson": last_lesson,
                    "teacherName": users_collection.find_one({"_id": ObjectId(course["teacherId"])})["name"]
                })
        
        return {"enrolled_courses": enrolled_courses}
    except:
        raise HTTPException(status_code=400, detail="Invalid student ID")

@app.get("/api/dashboard/teacher/{teacher_id}")
async def get_teacher_dashboard(teacher_id: str):
    """Get teacher dashboard data"""
    try:
        # Get all courses created by teacher
        courses = list(courses_collection.find({"teacherId": teacher_id}))
        
        teacher_courses = []
        for course in courses:
            course = ensure_course_content_ids(course)
            # Get enrollment count
            enrollments = progress_collection.count_documents({"courseId": str(course["_id"])})
            
            # Count total lessons
            total_lessons = 0
            for module in course.get("modules", []):
                total_lessons += len(module.get("lessons", []))
            
            teacher_courses.append({
                "courseId": str(course["_id"]),
                "title": course["title"],
                "description": course["description"],
                "totalLessons": total_lessons,
                "enrollments": enrollments,
                "created_at": course.get("created_at")
            })
        
        return {"courses": teacher_courses}
    except:
        raise HTTPException(status_code=400, detail="Invalid teacher ID")

# ==================== ENROLLMENT ENDPOINTS ====================

@app.post("/api/enroll")
async def enroll_student(student_id: str, course_id: str):
    """Enroll a student in a course"""
    try:
        # Check if already enrolled
        existing = progress_collection.find_one({
            "studentId": student_id,
            "courseId": course_id
        })
        
        if existing:
            return {"message": "Already enrolled"}
        
        # Create initial progress record
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        total_lessons = 0
        for module in course.get("modules", []):
            total_lessons += len(module.get("lessons", []))
        
        new_progress = {
            "studentId": student_id,
            "courseId": course_id,
            "completedLessons": [],
            "progressPercent": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = progress_collection.insert_one(new_progress)
        return {"message": "Enrolled successfully", "progressId": str(result.inserted_id)}
    except:
        raise HTTPException(status_code=400, detail="Invalid enrollment request")

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Database connection failed")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
