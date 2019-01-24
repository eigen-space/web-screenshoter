pipeline {
    agent {
        docker { image 'node:lts-alpine' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version';
                set +x;
                echo 'this is credentials: $FrontendDevAMSCredentials';
            }
        }
    }
}