pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Environment') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'git --version'
            }
        }

        stage('Install') {
            steps {
                // Orynqo does not currently commit a package-lock.json.
                // Use npm install for the bootstrap CI gate; migrate this to
                // npm ci once a reviewed lockfile is committed.
                bat 'npm install --no-audit --no-fund'
            }
        }

        stage('Typecheck') {
            steps {
                bat 'npm run typecheck'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Format Check') {
            steps {
                bat 'npm run format:check'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}
