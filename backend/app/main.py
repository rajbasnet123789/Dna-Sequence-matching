from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional
import os
import shutil
from . import models, auth, dna_utils
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DNA Sequence Comparison API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# === Auth Routes ===
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "username": user.username}

@app.post("/users/register")
async def register_user(username: str = Form(...), email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_email = db.query(models.User).filter(models.User.email == email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = auth.get_password_hash(password)
    db_user = models.User(username=username, email=email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User registered successfully", "user_id": db_user.id}

@app.get("/users/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"username": current_user.username, "email": current_user.email, "id": current_user.id}

# === DNA Processing Routes ===
@app.post("/dna/process-image")
async def process_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Save uploaded file
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process the image
    with open(file_location, "rb") as f:
        image_data = f.read()
    
    result = dna_utils.process_dna_image(image_data, file.filename)
    
    return result

@app.post("/dna/compare")
async def compare_dna(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Save uploaded files
    file1_location = f"uploads/{file1.filename}"
    file2_location = f"uploads/{file2.filename}"
    
    with open(file1_location, "wb") as buffer:
        shutil.copyfileobj(file1.file, buffer)
    
    with open(file2_location, "wb") as buffer:
        shutil.copyfileobj(file2.file, buffer)
    
    # Process the images
    with open(file1_location, "rb") as f:
        image1_data = f.read()
    
    with open(file2_location, "rb") as f:
        image2_data = f.read()
    
    result1 = dna_utils.process_dna_image(image1_data, file1.filename)
    result2 = dna_utils.process_dna_image(image2_data, file2.filename)
    
    # Initial comparison based on peak intensity
    return {
        "image1": result1,
        "image2": result2,
        "stage": "peak_intensity"
    }

@app.post("/dna/compare/algorithms")
async def compare_dna_algorithms(
    seq1: str = Form(...),
    seq2: str = Form(...),
    image1_name: str = Form(...),
    image2_name: str = Form(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Compare sequences using string matching algorithms
    comparison_result = dna_utils.compare_sequences(seq1, seq2)
    
    # Save report to database
    report = models.Report(
        user_id=current_user.id,
        image1_name=image1_name,
        image2_name=image2_name,
        sequence1=seq1,
        sequence2=seq2,
        peak_match_percentage=comparison_result["basic_match_percentage"],
        kmp_match_percentage=comparison_result["kmp"]["match_percentage"],
        rabin_karp_match_percentage=comparison_result["rabin_karp"]["match_percentage"],
        kmp_time=comparison_result["kmp"]["time_taken"],
        rabin_karp_time=comparison_result["rabin_karp"]["time_taken"]
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return {
        "report_id": report.id,
        "comparison": comparison_result,
        "stage": "algorithms"
    }

@app.get("/reports")
async def get_reports(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).all()
    return reports

@app.get("/reports/{report_id}")
async def get_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(models.Report).filter(models.Report.id == report_id, models.Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
