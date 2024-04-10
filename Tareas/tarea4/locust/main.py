from locust import HttpUser, TaskSet, task

class UserBehavior(TaskSet):
    @task
    def send_data(self):
        data = {
            "id": "1",
            "name": "Example",
            # Añade más campos de datos según sea necesario
        }
        self.client.post("/send-data", json=data)

class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    min_wait = 5000
    max_wait = 9000
