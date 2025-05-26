from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "PlanEats Backend is running!"}

# Further routers and application logic will be added here.
