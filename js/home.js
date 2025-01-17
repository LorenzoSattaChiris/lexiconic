/***************************************************************************
 * home.js
 *
 * Main client-side script for Lexiconic's home page.
 * 
 * In the future, several files could be implemented given the file size and complexity.
 ***************************************************************************/

/*============================================================================
 * I. GLOBAL DOM & EDITOR REFERENCES
 *==========================================================================*/

// DOM references for key UI components
const modal = document.querySelector('.welcome-modal');
const editor = document.querySelector('#editor');
const form = document.querySelector('#uploadForm');
const downloadBtn = document.querySelector('#download-btn');
const newPageBtn = document.querySelector('#new-page-btn');
const toggleSideModal = document.querySelector('#toggle-side-modal');
const sideModal = document.querySelector('#sideModal');
const aiSuggestionsBtn = document.getElementById('ai-suggestions-btn');
const updateHistoryBtn = document.getElementById('update-history-btn');
const aiSuggestions = document.getElementById('AI_suggestions');
const updateHistory = document.getElementById('Update_History');
const clearSuggestionsBtn = document.getElementById('clear-suggestions-btn');
const generateButton = document.getElementById('generateAI');
const openTutorialBtn = document.getElementById('open_tutorial');

// Additional references for version control section
const saveIntervalSelect = document.getElementById('saveInterval');
const maxVersionsSelect = document.getElementById('maxVersions');
const versionsContainer = document.getElementById('versionsContainer');
const noUpdatesEl = document.getElementById('noUpdates');
const modalBackdrop = document.getElementById('modalBackdrop');
const previewModal = document.getElementById('previewModal');
const previewModalLeft = document.getElementById('previewModalLeft');
const previewModalRight = document.getElementById('previewModalRight');
const previewRevertBtn = document.getElementById('previewRevertBtn');
const closePreviewBtn = document.getElementById('closePreviewBtn');

// Notification library initialisation
let notyf = new Notyf();


/*============================================================================
 * II. QUILL EDITOR INITIALISATION
 *    - The Quill editor is the main text area for writing and AI suggestions
 *==========================================================================*/
const quill = new Quill('#editor', {
    theme: 'bubble',
    placeholder: 'Your ICONIC writing here...',
    modules: {
        toolbar: {
            container: '#toolbar',
            handlers: {
                'ai-revision': triggerAIRevision,
                'dic-revision': triggerDictionaryRevision,
            },
        },
    },
});


/*============================================================================
 * III. WELCOME MODAL & FILE HANDLING
 *    - This section covers file upload + sample content loading
 *==========================================================================*/

/**
 * Option 1: File Upload
 * Initiates the file upload by sending data to the backend endpoint '/upload'
 * and handles the Quill insertion of server-parsed HTML on success.
 */
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(form);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            notyf.error(`Upload failed: HTTP status ${response.status}`);
            return;
        }

        const result = await response.json();
        if (result.success) {
            quill.clipboard.dangerouslyPasteHTML(0, result.html);
            notyf.success('📁 File Successfully Uploaded!');
            InitializeEditor();
        } else {
            console.error("Upload failed:", result.message);
            notyf.error('Error Uploading File: ' + result.message);
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        notyf.error('Error Uploading File: ' + error.message);
    }
});

/**
 * Auto-submits the file immediately after user selects it.
 */
document.querySelector('#file').addEventListener('change', function () {
    if (this.files.length > 0) {
        form.dispatchEvent(new Event('submit'));
    }
});

/**
 * Option 2: Predetermined Sample Content
 * Loads a predefined sample content into the editor when "Load Sample" is clicked.
 */
document.querySelector('#sampleButton').addEventListener('click', () => {
    const sampleContent = `
    <h2>Welcome to Lexiconic!</h2>
    <p>This is a <strong>sample document</strong> preloaded into the editor. Use this content to explore the editor's capabilities.</p>
    <ul>
      <li>Upload your documents to transform them into text (formatting support coming soon).</li>
      <li>Double click on text to edit and enhance your documents with our AI-powered tools.</li>
      <li>Enjoy a seamless and creative writing experience!</li>
    </ul>
  `;
    quill.clipboard.dangerouslyPasteHTML(0, sampleContent);
    InitializeEditor();
});

/**
 * Handles Tutorial Opening
**/
openTutorialBtn.addEventListener('click', (event) => {
    event.preventDefault();
    openTutorialBtn.setAttribute('href', 'javascript:void(0)'); // Prevent Navigation at the Moment
    notyf.success('Coming Soon....');
});


/*============================================================================
 * IV. EDITOR INITIALISATION & TOOLS HANDLING
 *==========================================================================*/

/**
 * Handles final initialisation of the editor after content is loaded or file upload completes.
 */
function InitializeEditor() {
    if (!modal) return;

    // Close modal with fade-out animation
    modal.classList.add('close-animation');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 1000);

    // Display the editor
    editor.style.display = 'block';

    // Show the Download and New Page buttons
    downloadBtn.style.display = 'block';
    newPageBtn.style.display = 'block';

    // Display the Quill toolbar
    const toolbar = document.querySelector('#toolbar');
    toolbar.style.display = 'block';

    // Show the floating side modal button
    showOpenSideModalBtn();
}

/**
 * Download the current editor content as an HTML file.
 */
downloadBtn.addEventListener('click', () => {
    const content = quill.root.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'editor-content.html';
    a.click();
    URL.revokeObjectURL(a.href);
});

/**
 * Opens a new browser tab/window with the same page (useful for multi-document workflows).
 */
newPageBtn.addEventListener('click', () => {
    window.open(window.location.href, '_blank');
});

/**
 * Toggles the "More" toolbar in the Quill editor (e.g. advanced formatting options).
 */
document.querySelector('.more-btn').addEventListener('click', function (event) {
    const hiddenButtons = document.querySelector('.hidden-buttons');
    hiddenButtons.style.display =
        hiddenButtons.style.display === 'block' ? 'none' : 'block';
    // Prevent the toolbar from closing immediately if the user clicks the dropdown
    event.stopPropagation();
});

/*============================================================================
 * V. SIDEBAR & TAB SWITCHING
 *    - For AI suggestions and update history
 *==========================================================================*/

/**
 * Displays the floating side-modal button with a fun rolling animation.
 */
function showOpenSideModalBtn() {
    toggleSideModal.style.display = "flex";
    toggleSideModal.classList.add("roll-in");
}

/**
 * Toggles open/close state of the side modal, adjusting editor width to accommodate.
 */
function openSideModal() {
    sideModal.classList.toggle('open');
    if (sideModal.classList.contains('open')) {
        const modalWidth = sideModal.offsetWidth;
        editor.style.width = `calc(100% - ${modalWidth}px)`;
    } else {
        editor.style.width = '100%';
    }
}

// Event: Side modal toggle (floating button)
toggleSideModal.addEventListener('click', (e) => {
    openSideModal();
    e.stopPropagation();
});

// Event: Tab switching logic (AI Suggestions vs. Update History)
aiSuggestionsBtn.addEventListener('click', () => {
    aiSuggestionsBtn.classList.add('active');
    updateHistoryBtn.classList.remove('active');
    aiSuggestions.classList.add('active');
    updateHistory.classList.remove('active');
});

updateHistoryBtn.addEventListener('click', () => {
    updateHistoryBtn.classList.add('active');
    aiSuggestionsBtn.classList.remove('active');
    updateHistory.classList.add('active');
    aiSuggestions.classList.remove('active');
});


/**************************************************************************************
 * VI. SUGGESTIONS & VERSION CONTROL LOGIC
 **************************************************************************************/


/*============================================================================
 * A. GLOBAL VARIABLES FOR SUGGESTIONS & VERSIONS
 *==========================================================================*/
let versionControlLog = [];   // For accepted/rejected suggestions
let suggestionCounter = 0;    // Unique IDs for suggestion blocks
let isAIRevisionRunning = false;
let isDictionaryRevisionRunning = false;
let isExplanationInProgress = false;


/*============================================================================
 * B. HELPER FUNCTIONS
 *    - Reusable string/diff utilities, and DOM manipulations
 *==========================================================================*/

/**
 * Removes leading and trailing quotes from a string, if present.
 */
function removeSurroundingQuotes(text) {
    if (!text) return text;
    let trimmed = text.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        trimmed = trimmed.substring(1, trimmed.length - 1);
    }
    return trimmed;
}

/**
 * Scrolls smoothly to the top of the AI Suggestions container.
 */
function scrollToAISuggestionsTop() {
    const container = document.getElementById("AI_suggestions");
    if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/**
 * After a suggestion is accepted or refused, record it in the version control log and re-render.
 */
function addToVersionControl(originalText, suggestionText, decision, suggestionType, suggestionId) {
    versionControlLog.push({
        id: suggestionId,
        type: suggestionType,
        original: originalText,
        suggestion: suggestionText,
        decision: decision,
        timestamp: new Date().toISOString(),
    });
    renderVersionControl();
}

/**
 * Renders the entire version control UI (filter dropdown + suggestion history list).
 */
function renderVersionControl() {
    const versionControlContainer = document.getElementById("version-control");
    if (!versionControlContainer) return;

    // Clear existing content
    versionControlContainer.innerHTML = "";

    // Create filter (All, Accepted, Rejected)
    const filterSelect = document.createElement("select");
    filterSelect.classList.add("version-control-filter");
    filterSelect.innerHTML = `
    <option value="all">Show All</option>
    <option value="accepted">Accepted Only</option>
    <option value="rejected">Rejected Only</option>
  `;
    filterSelect.addEventListener("change", () => {
        renderVersionControlList(filterSelect.value);
    });
    versionControlContainer.appendChild(filterSelect);

    // Create container for the version control entries
    const vcList = document.createElement("div");
    vcList.id = "version-control-list";
    versionControlContainer.appendChild(vcList);

    // Initial render with "all"
    renderVersionControlList("all");
}

/**
 * Renders the version control items based on the chosen filter.
 */
function renderVersionControlList(filter) {
    const vcList = document.getElementById("version-control-list");
    if (!vcList) return;
    vcList.innerHTML = "";

    const filtered = versionControlLog.filter(entry => {
        if (filter === "all") return true;
        return entry.decision === filter;
    });

    if (!filtered.length) {
        vcList.textContent = "No entries for the chosen filter.";
        return;
    }

    filtered
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // newest first
        .forEach(entry => {
            const item = document.createElement("div");
            item.className = "version-control-item";
            item.innerHTML = `
        <div><strong>Type:</strong> ${entry.type}</div>
        <div><strong>Original:</strong> ${entry.original}</div>
        <div><strong>Suggestion:</strong> ${entry.suggestion}</div>
        <div><strong>Decision:</strong> ${entry.decision}</div>
        <div><em>${new Date(entry.timestamp).toLocaleString()}</em></div>
        <br>
      `;
            vcList.appendChild(item);
        });
}

/**
 * Removes the suggestions block from the UI if it contains no child suggestions.
 */
function removeBlockIfEmpty(suggestionsList, block) {
    if (!suggestionsList.querySelector(".ai-suggestion")) {
        block.remove();
    }
}

/**
 * Helper for providing context around the selected text to AI, up to wordLimit on each side.
 */
function getContextAroundText(fullText, targetText, wordLimit = 200) {
    const words = fullText.split(/\s+/);
    const targetWords = targetText.split(/\s+/);
    const targetIndex = words.indexOf(targetWords[0]);

    // If not found, fallback to entire text
    if (targetIndex === -1) return fullText;

    const start = Math.max(0, targetIndex - wordLimit);
    const end = Math.min(words.length, targetIndex + targetWords.length + wordLimit);
    return words.slice(start, end).join(' ');
}


/*============================================================================
 * C. DISPLAYING SUGGESTIONS
 *    - Core routine that shows partial or entire text suggestions
 *==========================================================================*/

/**
 * Unified function for displaying AI or dictionary suggestions.
 * Dynamically creates a suggestions block, which can be expanded/collapsed.
 */
function displaySuggestions(displayData, range = null, parentRequestId = null) {
    // Ensure side modal is open
    if (!sideModal.classList.contains('open')) {
        openSideModal();
    }
    scrollToAISuggestionsTop();

    const container = document.getElementById("ai-suggestions-container");
    if (!container) return;

    // Increment global suggestion ID
    suggestionCounter += 1;
    const currentSuggestionId = suggestionCounter;

    // Suggestions outer block
    const block = document.createElement("div");
    block.className = "suggestions-block";

    // Toggle Show/Hide
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "▼ Hide Suggestions";
    toggleBtn.className = "toggle-suggestions-btn";
    let isCollapsed = false;

    toggleBtn.addEventListener("click", () => {
        isCollapsed = !isCollapsed;
        suggestionsList.style.display = isCollapsed ? "none" : "block";
        toggleBtn.textContent = isCollapsed ? "► Show Suggestions" : "▼ Hide Suggestions";
    });

    // Link to version control
    const versionControlLink = document.createElement("a");
    versionControlLink.href = "#version-control";
    versionControlLink.textContent = "Go to Past Suggestions";
    versionControlLink.className = "version-control-link";

    // Heading and sub-heading
    const heading = document.createElement("h3");
    heading.textContent = `[${new Date().toLocaleTimeString()}] ${displayData.type.toUpperCase()} Suggestions`;

    const subHeading = document.createElement("p");
    subHeading.innerHTML = `<strong>Original:</strong> ${displayData.originalText}`;

    const suggestionsList = document.createElement("div");
    suggestionsList.className = "suggestions-list";

    // If dictionary definitions exist, list them
    if (displayData.definitions && displayData.definitions.length) {
        const definitionsTitle = document.createElement("h4");
        definitionsTitle.textContent = "Definitions:";
        suggestionsList.appendChild(definitionsTitle);

        const definitionsUl = document.createElement("ul");
        displayData.definitions.forEach(def => {
            const li = document.createElement("li");
            li.textContent = def;
            definitionsUl.appendChild(li);
        });
        suggestionsList.appendChild(definitionsUl);
    }

    // For each suggestion, create an entry with accept/refuse/regenerate/explain
    displayData.suggestions.forEach(suggestionText => {
        const suggestionDiv = document.createElement("div");
        suggestionDiv.className = "ai-suggestion";

        const textDiv = document.createElement("div");
        textDiv.className = "ai-suggestion-text";
        textDiv.textContent = suggestionText;
        suggestionDiv.appendChild(textDiv);

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "ai-suggestion-actions";

        /*=================
          ACCEPT BUTTON
          =================*/
        const acceptBtn = document.createElement("button");
        acceptBtn.className = "ai-accept";
        acceptBtn.title = "Accept";
        acceptBtn.addEventListener("click", () => {
            try {
                // If entire document AI "review", replace full text
                if (displayData.type === "review") {
                    quill.deleteText(0, quill.getLength());
                    quill.insertText(0, suggestionText.trim());
                    notyf.success("✍ Entire document successfully updated!");
                } else {
                    // Partial text replacement
                    if (range && typeof quill !== "undefined") {
                        const cleanedSuggestion = removeSurroundingQuotes(suggestionText);
                        const before = quill.getText(range.index - 1, 1);
                        const after = quill.getText(range.index + range.length, 1);

                        const prefix = before && !/\s/.test(before) ? ' ' : ''; // Add space if needed before
                        const suffix = after && !/\s/.test(after) ? ' ' : '';   // Add space if needed after

                        quill.deleteText(range.index, range.length);
                        quill.insertText(range.index, prefix + cleanedSuggestion + suffix);
                    }
                }

                addToVersionControl(
                    displayData.originalText,
                    suggestionText,
                    "accepted",
                    displayData.type,
                    currentSuggestionId
                );

                suggestionDiv.remove();
                removeBlockIfEmpty(suggestionsList, block);
            } catch (err) {
                console.error("Error accepting suggestion:", err);
                notyf.error("Unable to accept suggestion: " + err.message);
            }
        });

        /*=================
          REFUSE BUTTON
          =================*/
        const refuseBtn = document.createElement("button");
        refuseBtn.className = "ai-refuse";
        refuseBtn.title = "Refuse";
        refuseBtn.addEventListener("click", () => {
            suggestionDiv.remove();
            addToVersionControl(
                displayData.originalText,
                suggestionText,
                "rejected",
                displayData.type,
                currentSuggestionId
            );
            removeBlockIfEmpty(suggestionsList, block);
        });

        /*=================
          REGENERATE BUTTON
          =================*/
        const regenerateBtn = document.createElement("button");
        regenerateBtn.className = "ai-regenerate";
        regenerateBtn.title = "Regenerate";
        regenerateBtn.addEventListener("click", () => {
            try {
                if (displayData.type === "dictionary") {
                    // For synonyms or dictionary expansions
                    triggerDictionaryRevision(suggestionText);
                } else if (displayData.type === "ai") {
                    // Disabled for now due to limit (No Context Would be Shared in the Current Implementation Rendering the Features Useless)
                    notyf.success("Feature Coming Soon");

                    // Previously...
                    // Partial text AI suggestion
                    // triggerAIRevision();
                } else if (displayData.type === "review") {
                    // Entire text AI suggestion 
                    triggerEntireTextAIReview();
                }
            } catch (err) {
                console.error("Error regenerating suggestion:", err);
                notyf.error("Unable to regenerate suggestion: " + err.message);
            }
        });

        /*=================
          EXPLAIN BUTTON
          =================*/
        const explainBtn = document.createElement("button");
        explainBtn.className = "ai-explain";
        explainBtn.title = "Explain";
        explainBtn.textContent = "?";
        explainBtn.addEventListener("click", async () => {
            notyf.success("We're working on it! 🧐");
            try {
                const selectionRange = quill.getSelection();
                const fullText = quill.getText();
                const selectedText = selectionRange
                    ? quill.getText(selectionRange.index, selectionRange.length).trim()
                    : "";
                const aiSuggestion = suggestionText;

                const response = await fetch("/ai/explain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        selectedText,
                        entireText: fullText,
                        aiSuggestion,
                    }),
                });

                if (!response.ok) {
                    notyf.error(`Explain failed: HTTP status ${response.status}`);
                    return;
                }

                const data = await response.json();
                if (data.error) {
                    notyf.error("Failed to fetch explanation: " + data.error);
                    return;
                }

                displaySuggestions({
                    type: "explanation",
                    originalText: selectedText || "Selected Text",
                    suggestions: [data.explanation || "No explanation available."],
                });
                notyf.success("Your explanation is ready! 🎉");
            } catch (error) {
                console.error("Error generating explanation:", error);
                notyf.error("Unable to fetch explanation: " + error.message);
            }
        });

        // Append the relevant buttons to action panel
        if (displayData.type !== "explanation") {
            actionsDiv.appendChild(acceptBtn);
        }
        actionsDiv.appendChild(refuseBtn);
        if (displayData.type !== "explanation") {
            actionsDiv.appendChild(regenerateBtn);
            actionsDiv.appendChild(explainBtn);
        }

        suggestionDiv.appendChild(actionsDiv);
        suggestionsList.appendChild(suggestionDiv);
    });

    // Build final block
    block.appendChild(toggleBtn);
    block.appendChild(versionControlLink);
    block.appendChild(heading);
    block.appendChild(subHeading);
    block.appendChild(suggestionsList);

    // Insert at the top (newest first)
    container.prepend(block);
}


/*============================================================================
 * D. MAIN TRIGGERS: AI PARTIAL, AI ENTIRE REVIEW, DICTIONARY, EXPLANATION
 *==========================================================================*/

/**
 * Trigger AI to revise a selected portion of text.
 */
async function triggerAIRevision() {
    if (isAIRevisionRunning) {
        console.warn('AI revision is already running. Skipping...');
        return;
    }
    isAIRevisionRunning = true;

    try {
        const range = quill.getSelection();
        if (!range) {
            notyf.error('Please select some text for AI suggestions.');
            return;
        }

        const fullText = quill.getText();
        const selectedText = quill.getText(range.index, range.length);
        const fullContext = getContextAroundText(fullText, selectedText, 200);

        notyf.success('✨ Your revision is in progress... Refining your text.');
        document.getElementById('loading-spinner').style.display = 'inline-flex';

        const response = await fetch('/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedText, fullContext }),
        });

        if (!response.ok) {
            notyf.error(`AI suggestion failed: HTTP status ${response.status}`);
            return;
        }

        const data = await response.json();
        if (data.error) {
            notyf.error('AI suggestion failed: ' + data.error);
            return;
        }

        const aiText = (data.choices?.[0]?.message?.content || '').trim();
        if (!aiText) {
            notyf.error('No AI suggestions received.');
            return;
        }

        const suggestions = aiText.split('---').map(s => s.trim()).filter(Boolean);
        if (!suggestions.length) {
            notyf.error('No AI suggestions received.');
            return;
        }

        displaySuggestions({
            type: 'ai',
            originalText: selectedText,
            suggestions,
        }, range);

    } catch (error) {
        console.error('Error in triggerAIRevision:', error);
        notyf.error('Error occurred while fetching AI suggestions.');
    } finally {
        isAIRevisionRunning = false;
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

/**
 * Trigger dictionary synonyms/definitions for a selected single word.
 */
async function triggerDictionaryRevision(prevSelectedWord) {
    if (isDictionaryRevisionRunning) {
        console.warn('Dictionary revision already in progress. Skipping...');
        return;
    }
    isDictionaryRevisionRunning = true;

    notyf.success('📚 Fetching the perfect words for you...');

    try {
        // If re-check triggered by "regenerate", we already have a word
        let selectedWord = prevSelectedWord;

        if (!selectedWord) {
            const range = quill.getSelection();
            if (!range) {
                notyf.error('Please select a word for dictionary suggestions.');
                return;
            }
            selectedWord = quill.getText(range.index, range.length).trim();
        }

        if (!selectedWord || selectedWord.includes(' ')) {
            notyf.error('Please select a single valid word for dictionary suggestions.');
            return;
        }

        const encodedWord = encodeURIComponent(selectedWord);
        const [synonymsResponse, definitionsResponse] = await Promise.all([
            fetch(`/dictionary/synonyms?word=${encodedWord}`),
            fetch(`/dictionary/definitions?word=${encodedWord}`)
        ]);

        if (!synonymsResponse.ok || !definitionsResponse.ok) {
            notyf.error('Error fetching dictionary data from server.');
            return;
        }

        const synonymsData = await synonymsResponse.json();
        const definitionsData = await definitionsResponse.json();

        const range = quill.getSelection();
        displaySuggestions({
            type: 'dictionary',
            originalText: selectedWord,
            suggestions: synonymsData || [],
            definitions: definitionsData || [],
        }, range);

    } catch (error) {
        console.error('Error fetching dictionary suggestions:', error);
        notyf.error('Failed to fetch dictionary suggestions: ' + error.message);
    } finally {
        isDictionaryRevisionRunning = false;
    }
}

/**
 * AI review for the entire text in the editor.
 */
async function triggerEntireTextAIReview() {
    if (!generateButton) return;

    const editorContent = quill ? quill.getText() : "";
    if (!editorContent || editorContent.trim() === "") {
        notyf.error("Editor is empty. Provide content for AI suggestions.");
        return;
    }

    // Show loading state
    generateButton.innerText = "Generating...";
    notyf.success("Generating... 🤖");

    try {
        const response = await fetch("/ai/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entireText: editorContent }),
        });

        if (!response.ok) {
            notyf.error(`AI review failed: HTTP status ${response.status}`);
            return;
        }

        const data = await response.json();
        if (data.error) {
            notyf.error("AI review failed: " + data.error);
        } else {
            const aiText = (data.choices?.[0]?.message?.content || "").trim();
            if (!aiText) {
                notyf.error("No AI suggestions received from review.");
                return;
            }

            const suggestions = aiText.split("---").map(s => s.trim()).filter(Boolean);
            displaySuggestions({
                type: "review",
                originalText: "Entire Document",
                suggestions,
            });
        }
    } catch (error) {
        console.error("Error fetching AI review:", error);
        notyf.error("Failed to fetch AI suggestions: " + error.message);
    } finally {
        generateButton.innerText = "Generate On the Entire Text";
    }
}


/*============================================================================
 * E. CLEAR SUGGESTIONS & DOM CONTENT LOADED
 *==========================================================================*/

/**
 * Clears only the suggestions from the AI suggestions container, leaving side container intact.
 */
document.addEventListener("DOMContentLoaded", () => {
    // For entire document AI revision
    if (generateButton) {
        generateButton.addEventListener("click", triggerEntireTextAIReview);
    }

    // Add version control container
    const versionControlContainer = document.createElement("div");
    versionControlContainer.id = "version-control";
    versionControlContainer.className = "version-control-container";
    const sideContentContainer = document.querySelector(".side-content-container");
    if (sideContentContainer) {
        sideContentContainer.appendChild(versionControlContainer);
        renderVersionControl();
    }

    // Clear suggestions button
    if (clearSuggestionsBtn) {
        clearSuggestionsBtn.addEventListener("click", () => {
            const container = document.getElementById("ai-suggestions-container");
            if (container) {
                Array.from(container.children).forEach(child => {
                    if (!child.matches("#clear-suggestions-btn")) {
                        child.remove();
                    }
                });
            }
        });
    }
});


/*============================================================================
 * F. FILE VERSION HISTORY & AUTO-SAVE
 *==========================================================================*/

// Global versioning variables
let currentContent = '';
let major = 1, minor = 0, patch = 0; // semantic version numbering
let versionHistory = [];
let autoSaveInterval = 5; // in seconds
let maxVersions = 50;
let autoSaveTimer = null;

// Track text changes with Quill
quill.on('text-change', () => {
    currentContent = quill.getText();
});

// Initialize default UI for versioning
saveIntervalSelect.value = autoSaveInterval.toString();
maxVersionsSelect.value = maxVersions.toString();

saveIntervalSelect.addEventListener('change', (e) => {
    autoSaveInterval = parseInt(e.target.value, 10);
    startAutoSave();
});
maxVersionsSelect.addEventListener('change', (e) => {
    maxVersions = parseInt(e.target.value, 10);
});

// Start auto-save process
startAutoSave();

/**
 * Sets up periodic saving of new versions at the chosen interval.
 */
function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    autoSaveTimer = setInterval(() => {
        const newContent = quill.getText().trim();
        if (!newContent) return; // don't save empty

        // Check if the exact content is already in the history
        const isDuplicate = versionHistory.some(v => v.content.trim() === newContent);
        if (!isDuplicate) {
            const linesChanged = calculateLinesChanged(newContent);
            saveVersion(newContent, linesChanged);
        }
    }, autoSaveInterval * 1000);

}

/**
 * Compares new content line count to last version's line count for a rough "changed lines".
 */
function calculateLinesChanged(newContent) {
    if (versionHistory.length === 0) {
        return newContent.split('\n').length;
    }
    const previousContent = versionHistory[versionHistory.length - 1].content;
    const prevCount = previousContent.split('\n').length;
    const newCount = newContent.split('\n').length;
    return Math.abs(newCount - prevCount);
}

/**
 * Saves a new version (auto increments patch number).
 */
function saveVersion(content, linesChanged) {
    patch++;
    const versionNum = `${major}.${minor}.${patch}`;

    const now = new Date();
    const newVersion = {
        version: versionNum,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        content,
        linesChanged,
        descendants: [],
    };

    versionHistory.push(newVersion);

    // Trim older versions beyond max limit
    if (versionHistory.length > maxVersions) {
        versionHistory.shift();
    }

    renderVersions();
}

/**
 * Refreshes the displayed version list in the "Update History" tab.
 */
function renderVersions() {
    if (versionHistory.length === 0) {
        noUpdatesEl.style.display = 'block';
        return;
    }
    noUpdatesEl.style.display = 'none';
    versionsContainer.innerHTML = '';

    // Render from first to last
    versionHistory.forEach((v, idx) => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('version-entry');

        // Header with version info
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('version-header');

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('version-info');
        infoDiv.innerHTML = `
      <span class="version-number">${idx === versionHistory.length - 1 ? 'Current Saved Version' : v.version}</span> –
      <span>${v.date} ${v.time}</span>
    `;

        // Key changes
        const keyChangesP = document.createElement('p');
        keyChangesP.classList.add('key-changes');
        keyChangesP.textContent = `Key Changes: ${v.linesChanged || 0} lines changed.`;

        // Preview Button
        const previewBtn = document.createElement('button');
        previewBtn.classList.add('preview-btn');
        previewBtn.textContent = 'Preview';
        previewBtn.addEventListener('click', () => {
            openPreviewModal(v);
        });

        // Revert Button
        const revertBtn = document.createElement('button');
        revertBtn.classList.add('revert-btn');
        revertBtn.textContent = 'Revert';
        revertBtn.addEventListener('click', () => {
            revertToVersion(v);
        });

        headerDiv.appendChild(infoDiv);
        headerDiv.appendChild(previewBtn);
        headerDiv.appendChild(revertBtn);

        entryDiv.appendChild(headerDiv);
        entryDiv.appendChild(keyChangesP);

        // Descendants nested versions
        if (v.descendants && v.descendants.length > 0) {
            const toggleBtn = document.createElement('button');
            toggleBtn.classList.add('descendants-toggle');
            toggleBtn.textContent = `Show ${v.descendants.length} descendant version(s)`;
            const descContainer = document.createElement('div');
            descContainer.classList.add('descendants-container');

            v.descendants.forEach((descVersion) => {
                const childDiv = renderDescendantVersion(descVersion);
                descContainer.appendChild(childDiv);
            });

            toggleBtn.addEventListener('click', () => {
                descContainer.style.display =
                    descContainer.style.display === 'none' ? 'block' : 'none';
            });

            entryDiv.appendChild(toggleBtn);
            entryDiv.appendChild(descContainer);
        }

        versionsContainer.appendChild(entryDiv);
    });
}

/**
 * Recursive renderer for nested "descendant" versions (revert trees).
 */
function renderDescendantVersion(versionObj) {
    const childDiv = document.createElement('div');
    childDiv.classList.add('version-entry');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('version-header');
    headerDiv.innerHTML = `
    <div class="version-info">
      <span class="version-number">${versionObj.version}</span> –
      <span>${versionObj.date} ${versionObj.time}</span>
    </div>
  `;

    const keyChangesP = document.createElement('p');
    keyChangesP.classList.add('key-changes');
    keyChangesP.textContent = `Key Changes: ${versionObj.linesChanged || 0} lines changed.`;

    // Preview button
    const previewBtn = document.createElement('button');
    previewBtn.classList.add('preview-btn');
    previewBtn.textContent = 'Preview';
    previewBtn.addEventListener('click', () => {
        openPreviewModal(versionObj);
    });

    // Revert button
    const revertBtn = document.createElement('button');
    revertBtn.classList.add('revert-btn');
    revertBtn.textContent = 'Revert';
    revertBtn.addEventListener('click', () => {
        revertToVersion(versionObj);
    });

    headerDiv.appendChild(previewBtn);
    headerDiv.appendChild(revertBtn);

    childDiv.appendChild(headerDiv);
    childDiv.appendChild(keyChangesP);

    // Nested descendants
    if (versionObj.descendants && versionObj.descendants.length > 0) {
        const toggleBtn = document.createElement('button');
        toggleBtn.classList.add('descendants-toggle');
        toggleBtn.textContent = `Show ${versionObj.descendants.length} descendant(s)`;
        const descContainer = document.createElement('div');
        descContainer.classList.add('descendants-container');

        versionObj.descendants.forEach((desc) => {
            descContainer.appendChild(renderDescendantVersion(desc));
        });

        toggleBtn.addEventListener('click', () => {
            descContainer.style.display =
                descContainer.style.display === 'none' ? 'block' : 'none';
        });

        childDiv.appendChild(toggleBtn);
        childDiv.appendChild(descContainer);
    }

    return childDiv;
}

/**
 * Revert the Quill editor to a chosen version. 
 */
function revertToVersion(targetVersion) {
    const idx = versionHistory.findIndex((v) => v.version === targetVersion.version);
    if (idx === -1) return;

    // 1. Re-inject content
    quill.deleteText(0, quill.getLength());
    quill.insertText(0, targetVersion.content);
    currentContent = targetVersion.content;

    // 2. Move subsequent versions into 'descendants'
    if (idx < versionHistory.length - 1) {
        const removed = versionHistory.splice(idx + 1);
        removed.forEach((desc) => {
            targetVersion.descendants.push(desc);
        });
    }

    // 3. Move chosen version to the end (making it "current")
    const chosen = versionHistory.splice(idx, 1)[0];
    versionHistory.push(chosen);

    notyf.success('Reverted to version ' + targetVersion.version);
    renderVersions();
}


/*============================================================================
 * G. PREVIEW MODAL & DIFF LOGIC
 *==========================================================================*/

/**
 * Opens the preview modal showing a side-by-side comparison 
 * of the chosen past version vs. current editor content.
 */
function openPreviewModal(pastVersionObj) {
    // Past version on the left
    previewModalLeft.textContent = pastVersionObj.content;

    // Compare old vs. new and highlight differences
    const diff = getHighlightedDiff(pastVersionObj.content, currentContent);
    previewModalLeft.innerHTML = diff.old;
    previewModalRight.innerHTML = diff.new;

    previewModal.classList.add('active');
    modalBackdrop.classList.add('active');

    // Close if clicking outside
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) {
            closePreviewModal();
        }
    };

    // Revert from inside preview
    previewRevertBtn.onclick = () => {
        revertToVersion(pastVersionObj);
        closePreviewModal();
    };
}

/**
 * Close the preview modal.
 */
function closePreviewModal() {
    previewModal.classList.remove('active');
    modalBackdrop.classList.remove('active');
}
closePreviewBtn.addEventListener('click', closePreviewModal);

/**
 * Generates a minimal highlight-diff for old vs. new text, line by line.
 */
function getHighlightedDiff(oldText, newText) {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    let resultOld = '';
    let resultNew = '';

    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
        const oldLine = oldLines[i] || '';
        const newLine = newLines[i] || '';

        if (oldLine === newLine) {
            resultOld += escapeHtml(oldLine) + '\n';
            resultNew += escapeHtml(newLine) + '\n';
        } else {
            const wordDiff = diffWords(oldLine, newLine);
            resultOld += wordDiff.oldLine + '\n';
            resultNew += wordDiff.newLine + '\n';
        }
    }
    return { old: resultOld, new: resultNew };
}

/**
 * Splits lines into words and tags differences as "highlight-added" or "highlight-removed".
 */
function diffWords(oldLine, newLine) {
    const oldWords = oldLine.split(' ');
    const newWords = newLine.split(' ');

    let oldLineHtml = '';
    let newLineHtml = '';

    oldWords.forEach(word => {
        if (!newWords.includes(word)) {
            oldLineHtml += `<span class="highlight-removed">${escapeHtml(word)}</span> `;
        } else {
            oldLineHtml += escapeHtml(word) + ' ';
        }
    });

    newWords.forEach(word => {
        if (!oldWords.includes(word)) {
            newLineHtml += `<span class="highlight-added">${escapeHtml(word)}</span> `;
        } else {
            newLineHtml += escapeHtml(word) + ' ';
        }
    });

    return {
        oldLine: oldLineHtml.trim(),
        newLine: newLineHtml.trim()
    };
}

/**
 * Helper Function to Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
