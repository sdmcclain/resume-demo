FROM e2bdev/code-interpreter:latest 

COPY ./data/resumes/processed /data/resumes/processed


COPY ./dist /dist
RUN pip install ./dist/*.whl
RUN pip install 'pydantic>2'

