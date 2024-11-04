let testJsonData = `{
    "info": {
        "order": 0,
        "content": {
            "name": "Dale Earnhardt",
            "contactInfo": [
                "Kannapolis, NC",
                "(123)-555-1234",
                "dale.e@gmail.com",
                "linkedin.com/in/daleE",
                "github.com/daleE"
            ]
        }
    },
    "education": {
        "order": 1,
        "content": [
            {
                "trainingName": "Forklift University",
                "institutionName": null,
                "degreeName": "BS, Forklift Technology and Security",
                "graduationDate": "May 2025"
            }
        ]
    },
    "skills": {
        "order": 2,
        "content": [
            {
                "categoryName": "Spoken Languages",
                "categoryValues": [
                    "Forklift-ese"
                ]
            },
            {
                "categoryName": "Tools",
                "categoryValues": [
                    "Forklifts"
                ]
            },
            {
                "categoryName": "Technologies",
                "categoryValues": [
                    "Forklifts"
                ]
            },
            {
                "categoryName": "Certifications",
                "categoryValues": [
                    "Forklift Certified"
                ]
            }
        ]
    },
    "workExperience": {
        "order": 3,
        "content": [
            {
                "company": "Forklifts Drivers of America",
                "subCompany": "",
                "jobTitle": "Forklift Driver",
                "location": "Columbus, OH",
                "timeframe": {
                    "start": "2022",
                    "end": "2023"
                },
                "experience": [
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum cursus imperdiet enim, quis laoreet elit vestibulum ut.",
                    "exp 2",
                    "exp 3"
                ]
            }
        ]
    },
    "projects": {
        "order": 4,
        "content": [
            {
                "name": "Test",
                "timeframe": {
                    "start": "April 2015",
                    "end": "Present"
                },
                "description": "A super interesting description here"
            }
        ]
    },
    "references": {
        "order": 5,
        "content": []
    }
}`;

const supportedSections = {
    "info": (info) => createHeader(info),
    "skills": (skills) => createSkillsSection(skills),
    "eduction": (education) => createEducationSection(education),
    "workExperience": (experience) => createWorkExperienceSection(experience),
    "projects": (projects) => createProjectsSection(projects),
    "references": (references) => createReferencesSection(references)
}