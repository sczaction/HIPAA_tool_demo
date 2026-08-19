"use strict";

let selectedPathway = "";

const screens = ["screen1", "screen2", "screen3"];

function showScreen(screenId) {
    screens.forEach((id) => {
        document.getElementById(id).hidden = id !== screenId;
    });

    const stepNumber = screenId === "screen1" ? 1 : screenId === "screen2" ? 2 : 3;
    updateProgress(stepNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProgress(activeStep) {
    [1, 2, 3].forEach((step) => {
        document.getElementById(`progress${step}`).classList.toggle("active", step <= activeStep);
    });
}

function choosePathway(pathway) {
    selectedPathway = pathway;
    document.getElementById("pathwayText").textContent = pathway;
    showScreen("screen2");
}

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function getCheckedItems(className, customInputId) {
    const values = Array.from(document.querySelectorAll(`.${className}:checked`))
        .map((checkbox) => checkbox.value);

    const customValue = getValue(customInputId);
    if (customValue) {
        values.push(customValue);
    }

    return values.length > 0 ? values.join(", ") : "Not provided";
}

function markInput(value) {
    return `[[INPUT]]${value}[[/INPUT]]`;
}

function stripInputMarkers(prompt) {
    return prompt.replaceAll("[[INPUT]]", "").replaceAll("[[/INPUT]]", "");
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderHighlightedPrompt(markedPrompt) {
    const escapedPrompt = escapeHtml(markedPrompt);

    return escapedPrompt
        .replaceAll("[[INPUT]]", '<span class="prompt-input-value">')
        .replaceAll("[[/INPUT]]", "</span>");
}

function collectFormData() {
    const selectedCaregiverRole = document.getElementById("caregiverRole").value;
    const selectedProviderRole = document.getElementById("providerRole").value;

    return {
        caregiverName: getValue("caregiverName") || "Not provided",
        patientName: getValue("patientName") || "Not provided",
        relationshipToPatient: getValue("relationshipToPatient") || "Not provided",
        corePathway: selectedPathway || "Not provided",
        treatmentSettings: getCheckedItems("setting", "customSetting"),
        providerRole: getValue("customProvider") || selectedProviderRole || "Not provided",
        caregiverRole: getValue("customRole") || selectedCaregiverRole || "Not provided",
        informationNeeded: getCheckedItems("need", "customNeed"),
        actionsSought: getCheckedItems("action", "customAction"),
        challenges: getCheckedItems("challenge", "customChallenge"),
        informationToShare: getCheckedItems("share", "customShare")
    };
}

function buildSystemPrompt(data) {
    return `You are an expert healthcare communications specialist with expertise in:

    HIPAA Privacy and Security Rules
    Family caregiver communication with providers
    Mental health care coordination
    Psychiatric care
    Advocating for loved one's treatment and patient advocacy

Your role is to provide the best communication tips and strategies for caregivers, as well as write professional and respectful letters. Make sure all of the details you provide are currently accurate based on your current knowledge. If you are uncertain about a citation or fact, do not use it, and do not fabricate one.

Your output should contain two sections:

    The first section is a formal letter with accurate HIPAA references and citations as it relates to the ${markInput(data.corePathway)}. The letter should be formal, containing a title, and conclude with next steps.

Your letters should:

    Be compassionate, professional, empathetic, and person centered.
    Never be adversarial or accusatory.
    NEVER provide legal advice.
    Focus on collaboration with the healthcare provider.
    Encourage patient safety and continuity of care.
    NEVER invent facts.
    Never assume information that has not been supplied.
    Reference and cite applicable HIPAA guidance and regulations when necessary. Always make sure your citations hold up over a long period of time.

When referencing HIPAA:

    Cite the applicable regulation.
    Explain why the regulation is relevant.
    Do not cite regulations that are unrelated to the situation.
    DO NOT fabricate the citations.

When you generate the caregiver letter, please make sure to generate the letter in a business letter format. This would mean using plaintext instead of a lightweight markup language like Markdown.

    The second section contains tips and strategies for talking with providers. Always make sure to be empathetic, person centered, and acknowledge the emotional impact on the caregiver.

Your tips should:

    Contain tips tailored to the situation detailed by the user's input.
    Be clear and general, so any person in the user's situation can utilize the tips.
    Cite HIPAA, but only if applicable to the tips presented.

Finally, your output should contain only the letter and tips, and absolutely nothing else.

The following information will be used to generate the letter. It is your job to interpret the supplied user information and incorporate it into the letter and communication guidance. If multiple values are provided for any of the fields, incorporate them naturally into the letter:

Patient & Caregiver Information:

    Caregiver Name: ${markInput(data.caregiverName)}
    Patient Name: ${markInput(data.patientName)}
    Relationship to Patient: ${markInput(data.relationshipToPatient)}

Care Pathway:

    Core Pathway: ${markInput(data.corePathway)}
        The Core Pathway can be one of these possible values:
            First-episode psychosis (possibly unclear prior diagnosis)
            Inpatient psychiatric hospitalization
            Long-term community mental health care
            Crisis relapse or repeated hospitalization

Treatment Setting:

    Treatment Setting(s): ${markInput(data.treatmentSettings)}
        The Treatment Setting can be one or more of these possible values:
            Primary care clinic
            Emergency department
            Outpatient psychiatric clinic
            Coordinated specialty care
            Inpatient unit
            Discharge planning
            Community mental health clinic
            Residential/home-based treatment
            Mobile crisis unit
            Crisis stabilization unit
            Other

Roles:

    Healthcare Provider Role: ${markInput(data.providerRole)}
        The Healthcare Provider Role can be one of these possible values:
            Primary care physician
            Emergency physician
            Psychiatrist
            Clinical psychologist
            Therapist
            Case manager
            Social worker
            Discharge planner
            Other

    Caregiver Role: ${markInput(data.caregiverRole)}
        The Caregiver Role can be one of these possible values:
            Family member
            Legal guardian
            Primary caregiver
            Spouse
            Parent
            Sibling
            Adult child
            Other

Current Needs:

    Information Needed: ${markInput(data.informationNeeded)}
        The Information Needed can be one or more of these possible values:
            Symptoms
            Recent behavior changes
            Observations from home
            Side effects
            Medication history
            Previous diagnosis details
            Current clinical needs
            Other

    Actions Sought: ${markInput(data.actionsSought)}
        The Action Sought can be one or more of these possible values:
            Discharge planning support
            Advocacy for treatment adjustments
            Planning needs based on symptom changes
            Coordination between providers
            Coordination between facilities
            Safety planning
            Other

    Current Challenges: ${markInput(data.challenges)}
        The current challenges can be one or more of these possible values:
            Limited communication
            Provider reluctance to share information
            Patient incapacity / anosognosia
            Repeated crises
            Gaps in follow-up care
            Other

Information to Share:

    Information to Share: ${markInput(data.informationToShare)}
        The information to share can be one or more of these possible values:
            Caregiver observations
            Medication adherence notes
            Safety concerns
            Family support capacity
            Other information the caregiver wishes to share

Review the completed prompt and ensure there is no placeholder text. Use only the information supplied above, and do not invent missing details.`;
}

function createPrompt(event) {
    event.preventDefault();

    const markedPrompt = buildSystemPrompt(collectFormData());
    const promptField = document.getElementById("systemPrompt");

    promptField.innerHTML = renderHighlightedPrompt(markedPrompt);
    promptField.dataset.plainText = stripInputMarkers(markedPrompt);
    document.getElementById("copyStatus").textContent =
        "All placeholders have been replaced with the information from the form.";
    showScreen("screen3");
}

function showCopySuccess() {
    const button = document.getElementById("copyPromptButton");

    window.clearTimeout(button.copySuccessTimer);
    button.classList.add("copy-success");
    button.textContent = "✓ Copied!";

    button.copySuccessTimer = window.setTimeout(() => {
        button.classList.remove("copy-success");
        button.textContent = "Copy System Prompt";
    }, 2000);
}

async function copyPrompt() {
    const promptField = document.getElementById("systemPrompt");
    const status = document.getElementById("copyStatus");

    const plainText = promptField.innerText;

    try {
        await navigator.clipboard.writeText(plainText);
        status.textContent = "System prompt copied to the clipboard.";
        showCopySuccess();
    } catch (error) {
        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(promptField);
        selection.removeAllRanges();
        selection.addRange(range);

        const copied = document.execCommand("copy");
        status.textContent = copied
            ? "System prompt copied to the clipboard."
            : "Automatic copy was blocked. The prompt is selected so you can copy it manually.";

        if (copied) {
            showCopySuccess();
        }
    }
}

function openClaude() {
    window.open("https://claude.ai/", "_blank", "noopener,noreferrer");
}

function toggleInstructions() {
    const button = document.getElementById("instructionsToggle");
    const content = document.getElementById("instructionsContent");
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    content.hidden = isExpanded;
}

function initializePage() {
    document.querySelectorAll(".pathway-card").forEach((button) => {
        button.addEventListener("click", () => choosePathway(button.dataset.pathway));
    });

    document.getElementById("promptForm").addEventListener("submit", createPrompt);
    document.getElementById("backButton").addEventListener("click", () => showScreen("screen1"));
    document.getElementById("editAnswersButton").addEventListener("click", () => showScreen("screen2"));
    document.getElementById("copyPromptButton").addEventListener("click", copyPrompt);
    document.getElementById("openClaudeButton").addEventListener("click", openClaude);
    document.getElementById("instructionsToggle").addEventListener("click", toggleInstructions);
}

document.addEventListener("DOMContentLoaded", initializePage);
