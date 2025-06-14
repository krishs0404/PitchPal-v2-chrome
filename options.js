// Options page script for ColdMail AI Assistant

document.addEventListener('DOMContentLoaded', function() {
  // Load saved options
  loadOptions();
  
  // Set up event listeners for buttons
  document.getElementById('save-options').addEventListener('click', saveOptions);
  document.getElementById('add-template').addEventListener('click', addTemplateForm);
  
  // Initial template examples
  displaySampleTemplates();
});

function loadOptions() {
  chrome.storage.local.get([
    'apiKey',
    'apiUrl',
    'userName',
    'userCompany',
    'userRole',
    'emailTone',
    'autoSuggest'
  ], function(items) {
    if (items.apiKey) document.getElementById('api-key').value = items.apiKey;
    if (items.apiUrl) document.getElementById('api-url').value = items.apiUrl;
    if (items.userName) document.getElementById('name').value = items.userName;
    if (items.userCompany) document.getElementById('company').value = items.userCompany;
    if (items.userRole) document.getElementById('role').value = items.userRole;
    if (items.emailTone) document.getElementById('tone').value = items.emailTone;
    if (items.autoSuggest !== undefined) document.getElementById('auto-suggest').checked = items.autoSuggest;
    
    // Load templates will be implemented in a real extension
  });
}

function saveOptions() {
  const apiKey = document.getElementById('api-key').value.trim();
  const apiUrl = document.getElementById('api-url').value.trim();
  const userName = document.getElementById('name').value.trim();
  const userCompany = document.getElementById('company').value.trim();
  const userRole = document.getElementById('role').value.trim();
  const emailTone = document.getElementById('tone').value;
  const autoSuggest = document.getElementById('auto-suggest').checked;
  
  // Validate API configuration
  if (!apiUrl.startsWith('https://')) {
    showStatus('API URL must start with https://', false);
    return;
  }

  // Save to Chrome storage
  chrome.storage.local.set({
    apiKey,
    apiUrl,
    userName,
    userCompany,
    userRole,
    emailTone,
    autoSuggest
  }, function() {
    showStatus('Options saved successfully!', true);
  });
}

function showStatus(message, isSuccess) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = isSuccess ? 'status success' : 'status error';
  status.style.display = 'block';
  
  setTimeout(function() {
    status.style.display = 'none';
  }, 3000);
}

// Sample templates for demonstration
function displaySampleTemplates() {
  const sampleTemplates = [
    {
      id: 'sales-template',
      name: 'Sales Outreach',
      subject: 'Improving {company} Results',
      body: 'Hi {name},\n\nI noticed that {company} has been making strides in the industry, and wanted to share how our solution could help you achieve even better results.\n\nWould you be available for a quick 15-minute call this week?\n\nBest regards,\n{userName}'
    },
    {
      id: 'follow-up-template',
      name: 'Follow-up Email',
      subject: 'Following up on our conversation',
      body: 'Hi {name},\n\nI hope you're doing well. I wanted to follow up on our previous conversation about {topic}.\n\nHave you had a chance to consider the proposal?\n\nBest regards,\n{userName}'
    }
  ];
  
  const templatesContainer = document.getElementById('templates-list');
  templatesContainer.innerHTML = '';
  
  sampleTemplates.forEach(template => {
    const templateEl = document.createElement('div');
    templateEl.className = 'template';
    templateEl.innerHTML = `
      <div class="template-header">
        <h3>${template.name}</h3>
        <div class="template-actions">
          <button class="edit-template" data-id="${template.id}">Edit</button>
          <button class="delete-template" data-id="${template.id}">Delete</button>
        </div>
      </div>
      <div>
        <strong>Subject:</strong> ${template.subject}
      </div>
      <div style="margin-top: 10px;">
        <strong>Body:</strong>
        <div style="white-space: pre-line; margin-top: 5px; color: #555;">${template.body}</div>
      </div>
    `;
    templatesContainer.appendChild(templateEl);
  });
  
  // Add event listeners to template buttons
  document.querySelectorAll('.edit-template').forEach(button => {
    button.addEventListener('click', function() {
      alert('Template editing will be implemented in the full version');
    });
  });
  
  document.querySelectorAll('.delete-template').forEach(button => {
    button.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this template?')) {
        // In a real implementation, this would delete the template
        button.closest('.template').remove();
      }
    });
  });
}

function addTemplateForm() {
  // In a real implementation, this would open a form to add a new template
  alert('Template creation feature will be implemented in the full version');
}
