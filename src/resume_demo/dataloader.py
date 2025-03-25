from pathlib import Path

from pydantic_settings import BaseSettings

from .models import ResumeSchema


class Config(BaseSettings):
    resume_data_dir: str = "/data/resumes/processed"


config = Config()


def load_resumes(resume_id: str | None = None):
    resume_paths = []
    if resume_id is not None:
        resume_paths.append(f"{config.resume_data_dir}/{resume_id}.json")
    else:
        for resume_path in Path(config.resume_data_dir).iterdir():
            resume_paths.append(resume_path)

    resumes = []
    for resume_path in resume_paths:
        with open(resume_path, "r") as f:
            resume = ResumeSchema.model_validate_json(f.read())
            resumes.append(resume)
    return resumes
