function findComposeToolbar() {
    const selectors = [
        '.aDh',
        '.btC',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null; // Return null if no toolbar is found
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.ail',
        '.gmail_qutoed',
        '.gmail_extra',
        '.gmail_signature',
        '.gmail_quote',
        '.gmail_quote_on',
        '.gmail_quote_on > div',
        '[role="presentation"]'
    ];
    
    for (const selector of selectors) {
        const contentElement = document.querySelector(selector);
        if (contentElement && contentElement.innerText.trim()) {
            return contentElement.innerText.trim();
        }
    }
    
    return ''; // Return empty string if no content found
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-J J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) return; // Prevent duplicate buttons

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, injecting AI button...");
    const button = createAIButton();
    
    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert("No email content found to generate a reply.");
                throw new Error("No email content found.");
            }

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI response');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"][contenteditable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.log("Compose box not found");
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate AI response');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasContentEditable = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasContentEditable) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
