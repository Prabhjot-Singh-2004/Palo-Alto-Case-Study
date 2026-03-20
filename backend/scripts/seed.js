const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const MarketData = require('../models/MarketData');
const Course = require('../models/Course');

const marketDataSeed = [
  {
    role: 'SDE 1',
    skills: [
      { skill: 'JavaScript', category: 'Foundational', importance: 'High', frequency: 95 },
      { skill: 'TypeScript', category: 'Foundational', importance: 'High', frequency: 85 },
      { skill: 'React.js', category: 'Frameworks', importance: 'High', frequency: 80 },
      { skill: 'Node.js', category: 'Frameworks', importance: 'High', frequency: 78 },
      { skill: 'Express.js', category: 'Frameworks', importance: 'High', frequency: 70 },
      { skill: 'MongoDB', category: 'Tools', importance: 'Medium', frequency: 55 },
      { skill: 'PostgreSQL', category: 'Tools', importance: 'Medium', frequency: 60 },
      { skill: 'Git', category: 'Tools', importance: 'High', frequency: 90 },
      { skill: 'REST APIs', category: 'Foundational', importance: 'High', frequency: 88 },
      { skill: 'HTML/CSS', category: 'Foundational', importance: 'High', frequency: 92 },
      { skill: 'Data Structures', category: 'Foundational', importance: 'High', frequency: 85 },
      { skill: 'Algorithms', category: 'Foundational', importance: 'High', frequency: 82 },
      { skill: 'Docker', category: 'Tools', importance: 'Medium', frequency: 45 },
      { skill: 'AWS', category: 'Tools', importance: 'Medium', frequency: 50 },
      { skill: 'CI/CD', category: 'Tools', importance: 'Medium', frequency: 40 },
      { skill: 'System Design', category: 'Foundational', importance: 'Medium', frequency: 65 },
      { skill: 'Testing (Jest/Mocha)', category: 'Tools', importance: 'Medium', frequency: 55 },
    ],
    description: 'Entry-level software development engineer position',
    sampleRequirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '1-2 years of experience or equivalent projects',
      'Proficiency in JavaScript/TypeScript',
      'Experience with React.js or similar frontend framework',
      'Understanding of RESTful API design',
      'Familiarity with version control (Git)',
      'Knowledge of data structures and algorithms',
      'Experience with at least one database (SQL or NoSQL)',
    ],
  },
  {
    role: 'Data Engineer',
    skills: [
      { skill: 'Python', category: 'Foundational', importance: 'High', frequency: 95 },
      { skill: 'SQL', category: 'Foundational', importance: 'High', frequency: 92 },
      { skill: 'Apache Spark', category: 'Frameworks', importance: 'High', frequency: 75 },
      { skill: 'Apache Kafka', category: 'Frameworks', importance: 'High', frequency: 70 },
      { skill: 'Airflow', category: 'Frameworks', importance: 'High', frequency: 68 },
      { skill: 'AWS (S3, Redshift, Glue)', category: 'Tools', importance: 'High', frequency: 72 },
      { skill: 'Databricks', category: 'Tools', importance: 'Medium', frequency: 55 },
      { skill: 'Snowflake', category: 'Tools', importance: 'Medium', frequency: 50 },
      { skill: 'Docker', category: 'Tools', importance: 'Medium', frequency: 55 },
      { skill: 'dbt', category: 'Tools', importance: 'Medium', frequency: 45 },
      { skill: 'Data Modeling', category: 'Foundational', importance: 'High', frequency: 80 },
      { skill: 'ETL/ELT Pipelines', category: 'Foundational', importance: 'High', frequency: 85 },
      { skill: 'Linux/Bash', category: 'Tools', importance: 'Medium', frequency: 60 },
      { skill: 'Git', category: 'Tools', importance: 'High', frequency: 80 },
      { skill: 'Data Warehousing', category: 'Foundational', importance: 'High', frequency: 75 },
    ],
    description: 'Entry to mid-level data engineering position',
    sampleRequirements: [
      'Strong proficiency in Python and SQL',
      'Experience building ETL/ELT pipelines',
      'Knowledge of distributed computing (Spark, Kafka)',
      'Familiarity with cloud platforms (AWS preferred)',
      'Understanding of data modeling concepts',
      'Experience with workflow orchestration tools (Airflow)',
      'Knowledge of data warehousing concepts',
    ],
  },
  {
    role: 'Cloud Architect',
    skills: [
      { skill: 'AWS', category: 'Tools', importance: 'High', frequency: 90 },
      { skill: 'Azure', category: 'Tools', importance: 'High', frequency: 75 },
      { skill: 'GCP', category: 'Tools', importance: 'Medium', frequency: 60 },
      { skill: 'Terraform', category: 'Tools', importance: 'High', frequency: 72 },
      { skill: 'Kubernetes', category: 'Frameworks', importance: 'High', frequency: 78 },
      { skill: 'Docker', category: 'Tools', importance: 'High', frequency: 85 },
      { skill: 'Linux', category: 'Foundational', importance: 'High', frequency: 80 },
      { skill: 'Networking (VPC, DNS, Load Balancing)', category: 'Foundational', importance: 'High', frequency: 82 },
      { skill: 'CI/CD', category: 'Tools', importance: 'High', frequency: 70 },
      { skill: 'Python', category: 'Foundational', importance: 'Medium', frequency: 65 },
      { skill: 'Security (IAM, Encryption)', category: 'Foundational', importance: 'High', frequency: 75 },
      { skill: 'Monitoring (CloudWatch, Datadog)', category: 'Tools', importance: 'Medium', frequency: 55 },
      { skill: 'Serverless (Lambda)', category: 'Frameworks', importance: 'Medium', frequency: 50 },
      { skill: 'Microservices', category: 'Foundational', importance: 'High', frequency: 68 },
      { skill: 'Cost Optimization', category: 'Soft Skills', importance: 'Medium', frequency: 45 },
    ],
    description: 'Cloud infrastructure architect position',
    sampleRequirements: [
      'Strong experience with AWS or equivalent cloud platform',
      'Infrastructure as Code (Terraform, CloudFormation)',
      'Container orchestration (Kubernetes, ECS)',
      'Network architecture and security',
      'CI/CD pipeline design and implementation',
      'Cost optimization and capacity planning',
      'System design for scalability and high availability',
    ],
  },
  {
    role: 'Full Stack Developer',
    skills: [
      { skill: 'JavaScript', category: 'Foundational', importance: 'High', frequency: 95 },
      { skill: 'TypeScript', category: 'Foundational', importance: 'High', frequency: 88 },
      { skill: 'React.js', category: 'Frameworks', importance: 'High', frequency: 85 },
      { skill: 'Node.js', category: 'Frameworks', importance: 'High', frequency: 82 },
      { skill: 'Next.js', category: 'Frameworks', importance: 'High', frequency: 70 },
      { skill: 'MongoDB', category: 'Tools', importance: 'Medium', frequency: 60 },
      { skill: 'PostgreSQL', category: 'Tools', importance: 'High', frequency: 72 },
      { skill: 'REST APIs', category: 'Foundational', importance: 'High', frequency: 90 },
      { skill: 'GraphQL', category: 'Foundational', importance: 'Medium', frequency: 45 },
      { skill: 'Git', category: 'Tools', importance: 'High', frequency: 92 },
      { skill: 'Docker', category: 'Tools', importance: 'Medium', frequency: 55 },
      { skill: 'AWS', category: 'Tools', importance: 'Medium', frequency: 50 },
      { skill: 'HTML/CSS', category: 'Foundational', importance: 'High', frequency: 90 },
      { skill: 'Testing', category: 'Tools', importance: 'Medium', frequency: 60 },
      { skill: 'System Design', category: 'Foundational', importance: 'Medium', frequency: 55 },
    ],
    description: 'Full stack web developer position',
    sampleRequirements: [
      'Proficiency in JavaScript/TypeScript',
      'Experience with React.js and Node.js',
      'Database design and management (SQL and/or NoSQL)',
      'RESTful API development',
      'Version control with Git',
      'Understanding of cloud deployment',
      'Agile development experience',
    ],
  },
];

const coursesSeed = [
  // JavaScript courses
  { title: 'JavaScript: Understanding the Weird Parts', platform: 'Udemy', url: 'https://www.udemy.com/course/understand-javascript/', skill: 'JavaScript', difficulty: 'Intermediate', estimatedWeeks: 2, description: 'Deep dive into JavaScript internals, closures, prototypes', tags: ['javascript', 'fundamentals'] },
  { title: 'The Complete JavaScript Course', platform: 'Udemy', url: 'https://www.udemy.com/course/the-complete-javascript-course/', skill: 'JavaScript', difficulty: 'Beginner', estimatedWeeks: 4, description: 'From zero to expert in JavaScript', tags: ['javascript', 'beginner'] },

  // TypeScript courses
  { title: 'TypeScript for Professionals', platform: 'Udemy', url: 'https://www.udemy.com/course/typescript-for-professionals/', skill: 'TypeScript', difficulty: 'Intermediate', estimatedWeeks: 2, description: 'Advanced TypeScript patterns and best practices', tags: ['typescript'] },
  { title: 'Understanding TypeScript', platform: 'Udemy', url: 'https://www.udemy.com/course/understanding-typescript/', skill: 'TypeScript', difficulty: 'Beginner', estimatedWeeks: 3, description: 'Complete TypeScript guide from basics to advanced', tags: ['typescript', 'beginner'] },

  // React courses
  { title: 'React - The Complete Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide/', skill: 'React.js', difficulty: 'Beginner', estimatedWeeks: 4, description: 'Comprehensive React course with hooks and Redux', tags: ['react', 'frontend'] },
  { title: 'React Testing Library Tutorial', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=7r4xVDI2vho', skill: 'React.js', difficulty: 'Intermediate', estimatedWeeks: 1, description: 'Testing React components effectively', tags: ['react', 'testing'] },

  // Node.js courses
  { title: 'Node.js, Express, MongoDB & More', platform: 'Udemy', url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', skill: 'Node.js', difficulty: 'Intermediate', estimatedWeeks: 4, description: 'Complete backend development with Node.js', tags: ['nodejs', 'backend'] },
  { title: 'Node.js Tutorial for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', skill: 'Node.js', difficulty: 'Beginner', estimatedWeeks: 1, description: 'Quick start with Node.js basics', tags: ['nodejs', 'beginner'] },

  // Express.js courses
  { title: 'Express.js Fundamentals', platform: 'Pluralsight', url: 'https://www.pluralsight.com/courses/expressjs-fundamentals', skill: 'Express.js', difficulty: 'Beginner', estimatedWeeks: 1, description: 'Building REST APIs with Express.js', tags: ['express', 'api'] },
  { title: 'REST API Design Best Practices', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=SLwpqD8n3d0', skill: 'REST APIs', difficulty: 'Intermediate', estimatedWeeks: 1, description: 'Designing scalable REST APIs', tags: ['api', 'design'] },

  // MongoDB courses
  { title: 'MongoDB - The Complete Developer\'s Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/', skill: 'MongoDB', difficulty: 'Beginner', estimatedWeeks: 3, description: 'Complete MongoDB from basics to advanced queries', tags: ['mongodb', 'database'] },

  // PostgreSQL courses
  { title: 'SQL & PostgreSQL for Beginners', platform: 'Udemy', url: 'https://www.udemy.com/course/sql-and-postgresql/', skill: 'PostgreSQL', difficulty: 'Beginner', estimatedWeeks: 2, description: 'Learn SQL with PostgreSQL', tags: ['sql', 'postgresql'] },

  // Git courses
  { title: 'Git & GitHub - The Practical Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/git-github-practical-guide/', skill: 'Git', difficulty: 'Beginner', estimatedWeeks: 1, description: 'Version control from zero to hero', tags: ['git', 'version-control'] },

  // Data Structures courses
  { title: 'JavaScript Algorithms and Data Structures', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', skill: 'Data Structures', difficulty: 'Intermediate', estimatedWeeks: 4, description: 'Algorithms and data structures with JavaScript', tags: ['algorithms', 'data-structures'] },
  { title: 'Master the Coding Interview: Data Structures + Algorithms', platform: 'Udemy', url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/', skill: 'Data Structures', difficulty: 'Intermediate', estimatedWeeks: 6, description: 'Complete DSA preparation for interviews', tags: ['algorithms', 'interview-prep'] },

  // Docker courses
  { title: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', skill: 'Docker', difficulty: 'Beginner', estimatedWeeks: 3, description: 'Containerization from scratch', tags: ['docker', 'kubernetes'] },

  // AWS courses
  { title: 'AWS Certified Cloud Practitioner', platform: 'A Cloud Guru', url: 'https://acloudguru.com/course/aws-certified-cloud-practitioner', skill: 'AWS', difficulty: 'Beginner', estimatedWeeks: 4, description: 'AWS fundamentals and certification prep', tags: ['aws', 'cloud'] },

  // Python courses
  { title: 'Python for Data Engineering', platform: 'DataCamp', url: 'https://www.datacamp.com/courses/python-for-data-engineering', skill: 'Python', difficulty: 'Intermediate', estimatedWeeks: 3, description: 'Python focused on data engineering tasks', tags: ['python', 'data-engineering'] },
  { title: '100 Days of Code: Python', platform: 'Udemy', url: 'https://www.udemy.com/course/100-days-of-code/', skill: 'Python', difficulty: 'Beginner', estimatedWeeks: 8, description: 'Comprehensive Python bootcamp', tags: ['python', 'beginner'] },

  // SQL courses
  { title: 'The Complete SQL Bootcamp', platform: 'Udemy', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', skill: 'SQL', difficulty: 'Beginner', estimatedWeeks: 2, description: 'SQL from zero to advanced', tags: ['sql', 'database'] },

  // Spark courses
  { title: 'Apache Spark 3 - Spark Programming in Python', platform: 'Udemy', url: 'https://www.udemy.com/course/apache-spark-programming-in-python-for-beginners/', skill: 'Apache Spark', difficulty: 'Intermediate', estimatedWeeks: 3, description: 'Big data processing with PySpark', tags: ['spark', 'big-data'] },

  // Kafka courses
  { title: 'Apache Kafka Series', platform: 'Udemy', url: 'https://www.udemy.com/course/apache-kafka/', skill: 'Apache Kafka', difficulty: 'Intermediate', estimatedWeeks: 3, description: 'Event streaming with Kafka', tags: ['kafka', 'streaming'] },

  // Airflow courses
  { title: 'The Complete Hands-On Apache Airflow', platform: 'Udemy', url: 'https://www.udemy.com/course/the-complete-hands-on-course-to-master-apache-airflow/', skill: 'Airflow', difficulty: 'Intermediate', estimatedWeeks: 2, description: 'Workflow orchestration with Airflow', tags: ['airflow', 'orchestration'] },

  // Kubernetes courses
  { title: 'Kubernetes for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', skill: 'Kubernetes', difficulty: 'Beginner', estimatedWeeks: 2, description: 'K8s fundamentals explained', tags: ['kubernetes', 'containers'] },

  // Terraform courses
  { title: 'Terraform for Beginners', platform: 'Udemy', url: 'https://www.udemy.com/course/terraform-beginner-to-advanced/', skill: 'Terraform', difficulty: 'Beginner', estimatedWeeks: 2, description: 'Infrastructure as Code with Terraform', tags: ['terraform', 'iac'] },

  // System Design courses
  { title: 'System Design Interview', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=i53Gi-K3n_M', skill: 'System Design', difficulty: 'Intermediate', estimatedWeeks: 3, description: 'System design concepts for interviews', tags: ['system-design', 'interview'] },

  // Next.js courses
  { title: 'Next.js 14 & React - The Complete Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/', skill: 'Next.js', difficulty: 'Intermediate', estimatedWeeks: 3, description: 'Full-stack development with Next.js', tags: ['nextjs', 'react'] },

  // CI/CD courses
  { title: 'CI/CD with GitHub Actions', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', skill: 'CI/CD', difficulty: 'Beginner', estimatedWeeks: 1, description: 'Automating deployments with GitHub Actions', tags: ['cicd', 'devops'] },

  // HTML/CSS courses
  { title: 'HTML & CSS Crash Course', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=hu-q2zYwEYs', skill: 'HTML/CSS', difficulty: 'Beginner', estimatedWeeks: 1, description: 'Web fundamentals', tags: ['html', 'css'] },

  // Testing courses
  { title: 'JavaScript Testing with Jest', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=8Xwq35cPwYk', skill: 'Testing (Jest/Mocha)', difficulty: 'Beginner', estimatedWeeks: 1, description: 'Unit testing JavaScript applications', tags: ['testing', 'jest'] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await MarketData.deleteMany({});
    await Course.deleteMany({});

    // Insert seed data
    await MarketData.insertMany(marketDataSeed);
    console.log(`Seeded ${marketDataSeed.length} market data entries`);

    await Course.insertMany(coursesSeed);
    console.log(`Seeded ${coursesSeed.length} course entries`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
