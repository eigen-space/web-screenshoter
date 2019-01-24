pipeline {
    agent {
        docker { image 'node:lts-alpine' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version';
                sh 'this is credentials ${FrontendDevAMSCredentials}';
            }
        }
    }
}