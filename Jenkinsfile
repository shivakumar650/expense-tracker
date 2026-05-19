pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // Jenkins automatically pulls your latest code from GitHub
                git branch: 'main', url: 'https://github.com/shivakumar650/expense-tracker.git'
            }
        }
        
        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t pashamwad123/expense-tracker-backend:latest .'
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                        sh 'docker push pashamwad123/expense-tracker-backend:latest'
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t pashamwad123/expense-tracker-frontend:latest .'
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                        sh 'docker push pashamwad123/expense-tracker-frontend:latest'
                    }
                }
            }
        }
        
        stage('Success') {
            steps {
                echo 'CI/CD Pipeline ran successfully! Docker images have been built and pushed to Docker Hub.'
            }
        }
    }
}
