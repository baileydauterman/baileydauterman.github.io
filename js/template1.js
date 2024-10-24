const templatedHtml = `
    <div class="header text-center fs-2 m-0" id="userName">
    </div>

    <div class="hstack p-0 m-0" id="userInfo">
    </div>

    <div class="pb-2 visually-hidden" id="education">
        <p class="fs-4 m-0">Education</p>
        <hr class="m-0" />
    </div>

    <div class="pb-2 visually-hidden" id="skills">
        <p class="fs-4 m-0">Skills</p>
        <hr class="m-0">
    </div>

    <div class="visually-hidden" id="experience">
        <p class="fs-4 m-0">Experience</p>
        <hr class="m-0">
    </div>

    <div class="visually-hidden" id="projects">
        <p class="fs-4 m-0">Projects</p>
        <hr class="m-0">
    </div>

    <div id="references">
        <p class="text-muted text-center fw-light fst-italic">References available upon request</p>
    </div>
`;

function createUserNameHeader(name) {
    let userNameDiv = document.getElementById("userName");
    userNameDiv.textContent = name
    document.title = name + " Resume"
}

function createContactInfo(contactInfo) {
    let contactInfoDiv = document.getElementById("userInfo");
    contactInfo.forEach(e => {
        child = createDiv(e, ["fw-light", "text-muted", "mx-auto"]);
        contactInfoDiv.appendChild(child);
    });
}

function createEducationSection(education) {
    let educationDiv = document.getElementById("education");
    educationDiv.classList.remove(visuallyHidden);

    education.forEach(e => {
        let stack = createHStack();

        let title = createDiv(e.trainingName, ["fw-bold"]);
        stack.appendChild(title);

        let institution = createDiv(e.institutionName, ["text-muted", "fw-lighter"]);
        stack.appendChild(institution);

        let graduation = createDiv(e.graduationDate, ["text-muted", "ms-auto", "fw-light"]);
        stack.appendChild(graduation);

        let degree = createDiv(e.degreeName, ["fst-italic"]);

        educationDiv.appendChild(stack);
        educationDiv.appendChild(degree);
    });
}

function createSkillsSection(skills) {
    let skillsDiv = document.getElementById("skills");
    skillsDiv.classList.remove(visuallyHidden);

    skills.forEach(e => {
        let wrappingDiv = createDiv("", []);

        let catName = document.createElement("strong");
        catName.textContent = e.categoryName + ": ";

        wrappingDiv.appendChild(catName);
        wrappingDiv.append(e.categoryValues.join(", "));

        skillsDiv.appendChild(wrappingDiv);
    });
}

function createWorkExperienceSection(experience) {
    let experienceDiv = document.getElementById("experience");
    experienceDiv.classList.remove(visuallyHidden);

    experience.forEach(e => {
        let wrappingDiv = document.createElement("div");

        let headerDiv = createHStack();

        let title = createDiv(e.company, ["fw-bold"]);
        headerDiv.appendChild(title);

        if (e.subCompany) {
            title = createDiv(e.subCompany, ["text-muted", "fw-lighter"]);
            headerDiv.appendChild(title);
        }

        title = document.createElement("div");
        title = createDiv(e.location, ["text-muted", "ms-auto", "fw-light"]);
        headerDiv.appendChild(title);

        wrappingDiv.appendChild(headerDiv);

        let titleDiv = createHStack();

        title = createDiv(e.jobTitle, ["fst-italic"]);
        titleDiv.appendChild(title);

        title = createDiv(e.timeframe.start + " - " + e.timeframe.end, ["text-muted", "ms-auto", "fw-light"]);
        titleDiv.appendChild(title);

        wrappingDiv.appendChild(titleDiv);

        let experienceList = document.createElement("ul");
        experienceList.classList.add("fs-7", "p-3", "pt-0", "m-0", "ms-1");

        e.experience.forEach(ex => {
            let exp = document.createElement("li");
            exp.textContent = ex;
            experienceList.appendChild(exp);
        });

        wrappingDiv.appendChild(experienceList);
        experienceDiv.appendChild(wrappingDiv);
    });
}

function createProjectsSection(projects) {
    let projectsDiv = document.getElementById("projects");
    projectsDiv.classList.remove(visuallyHidden);

    projects.forEach(e => {
        let wrappingDiv = createDiv("", []);
        let hstack = createHStack();
        let name = createDiv(e.name, ["fw-bold"]);
        let timeframe = createTimeFrameDiv(e.timeframe);
        let description = createDiv(e.description, []);

        hstack.appendChild(name);
        hstack.appendChild(timeframe);
        wrappingDiv.appendChild(hstack);
        wrappingDiv.appendChild(description);
        projectsDiv.appendChild(wrappingDiv);
    });
}