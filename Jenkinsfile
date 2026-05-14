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
                    // Jenkins automatically builds the backend Docker image
                    sh 'docker build -t expense-tracker-backend:latest .'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    // Jenkins automatically builds the frontend Docker image
                    sh 'docker build -t expense-tracker-frontend:latest .'
                }
            }
        }
        
        stage('Success') {
            steps {
                echo 'CI/CD Pipeline ran successfully! Docker images have been built by Jenkins.'
            }
        }
    }
}
