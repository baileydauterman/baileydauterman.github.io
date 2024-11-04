function createSectionDiv(title) {
    let newSectionDiv = createDiv("", ["pb-2"]);
    newSectionDiv.appendChild(createElement("p", title, ["fs-4", "m-0"]));
    newSectionDiv.appendChild(createElement("hr", "", ["m-0"]));
    return newSectionDiv;
}

function createHeader(headerInfo) {
    let headerDiv = createDiv("", []);
    headerDiv.append(createUserNameHeader(headerInfo.name));
    headerDiv.append(createContactInfo(headerInfo.contactInfo));
    return headerDiv;
}

function createUserNameHeader(name) {
    let userNameDiv = createDiv("", ["header", "text-center", "fs-2", "m-0"]);
    userNameDiv.textContent = name
    document.title = name + " Resume"

    return userNameDiv;
}

function createContactInfo(contactInfo) {
    let contactInfoDiv = createDiv("", ["hstack", "p-0", "m-0"]);
    contactInfo.forEach(e => {
        child = createDiv(e, ["fw-light", "text-muted", "mx-auto"]);
        contactInfoDiv.appendChild(child);
    });

    return contactInfoDiv;
}

function createEducationSection(education) {
    let educationDiv = createSectionDiv("Education")

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

    return educationDiv;
}

function createSkillsSection(skills) {
    let skillsDiv = createSectionDiv("Skills");

    skills.forEach(e => {
        let wrappingDiv = createDiv("", []);

        let catName = document.createElement("strong");
        catName.textContent = e.categoryName + ": ";

        wrappingDiv.appendChild(catName);
        wrappingDiv.append(e.categoryValues.join(", "));

        skillsDiv.appendChild(wrappingDiv);
    });

    return skillsDiv;
}

function createWorkExperienceSection(experience) {
    let experienceDiv = createSectionDiv("Experience")

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

    return experienceDiv;
}

function createProjectsSection(projects) {
    let projectsDiv = createSectionDiv("Projects")

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

    return projectsDiv
}

function createReferencesSection(references) {
    var referencesDiv = createDiv("", []);
    referencesDiv.appendChild(createElement("p", "References available upon request", ["text-muted", "text-center", "fw-light", "fst-italic"]))
    return referencesDiv;
}