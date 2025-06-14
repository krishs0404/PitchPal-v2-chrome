// Popup script for ColdMail AI Assistant

document.addEventListener('DOMContentLoaded', function() {
  const generateButton = document.getElementById('generate');
  const recipientTextarea = document.getElementById('recipient');
  const purposeInput = document.getElementById('purpose');
  const resultDiv = document.getElementById('result');

  // Load previously entered data
  chrome.storage.local.get(['recipient', 'purpose'], function(data) {
    if (data.recipient) recipientTextarea.value = data.recipient;
    if (data.purpose) purposeInput.value = data.purpose;
  });

  generateButton.addEventListener('click', function() {
    const recipient = recipientTextarea.value.trim();
    const purpose = purposeInput.value.trim();

    // Save entered data
    chrome.storage.local.set({
      'recipient': recipient,
      'purpose': purpose
    });

    if (!recipient || !purpose) {
      alert('Please fill in all fields');
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    // In a real implementation, this would call your API
    // For now, we'll simulate the API call with a timeout
    setTimeout(() => {
      const sampleEmail = generateSampleEmail(recipient, purpose);
      
      resultDiv.innerHTML = `
        <h3>Generated Email</h3>
        <p><strong>Subject:</strong> ${sampleEmail.subject}</p>
        <p><strong>Body:</strong></p>
        <div>${sampleEmail.body.replace(/\\n/g, '<br>')}</div>
        <div style="margin-top: 15px;">
          <button id="copy-btn">Copy to Clipboard</button>
          <button id="customize-btn">Customize</button>
        </div>
      `;
      
      resultDiv.style.display = 'block';
      
      document.getElementById('copy-btn').addEventListener('click', function() {
        navigator.clipboard.writeText(`Subject: ${sampleEmail.subject}\n\n${sampleEmail.body}`)
          .then(() => {
            alert('Email copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
          });
      });

      document.getElementById('customize-btn').addEventListener('click', function() {
        // In a real implementation, this would open a customization interface
        alert('Customization feature coming soon!');
      });

      generateButton.disabled = false;
      generateButton.textContent = 'Generate Personalized Email';
    }, 2000);
  });

  function generateSampleEmail(recipient, purpose) {
    // This is just a placeholder - in the real extension,
    // this would make an API call to your backend
    
    // Parse recipient info
    const lines = recipient.split('\\n');
    let name = 'there';
    let company = 'your company';
    let role = 'professional';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('name:')) {
        name = line.split(':')[1].trim();
      }
      if (line.toLowerCase().includes('company:')) {
        company = line.split(':')[1].trim();
      }
      if (line.toLowerCase().includes('role:') || line.toLowerCase().includes('title:')) {
        role = line.split(':')[1].trim();
      }
    }
    
    // Simple templates based on purpose
    let subject, body;
    
    switch (purpose.toLowerCase()) {
      case 'sales':
        subject = `Improving ${company}'s Results with Our Solution`;
        body = `Hi ${name},\n\nI noticed that ${company} has been making strides in the industry, and as a ${role}, you might be interested in how our solution can help you achieve even better results.\n\nI'd love to schedule a quick 15-minute call to discuss how we can help you specifically.\n\nWould you be available this week for a brief conversation?\n\nBest regards,\n[Your Name]`;
        break;
      
      case 'partnership':
        subject = `Potential Partnership Opportunity with ${company}`;
        body = `Hi ${name},\n\nI've been following ${company}'s recent achievements and I believe there could be a valuable partnership opportunity between our organizations.\n\nAs a ${role}, you might appreciate how our complementary services could benefit both companies and create new opportunities.\n\nI'd appreciate the chance to discuss this further. Are you available for a brief call next week?\n\nLooking forward to your response,\n[Your Name]`;
        break;
        
      case 'job application':
        subject = `Experienced Candidate Interested in Opportunities at ${company}`;
        body = `Dear ${name},\n\nI hope this email finds you well. I'm reaching out because I'm very interested in exploring opportunities at ${company}, particularly given your role as ${role}.\n\nMy background includes [your relevant experience] which I believe would be valuable for your team. I've been following ${company}'s work on [recent project/news] and am impressed with your approach.\n\nWould you be open to a brief conversation about how my skills might benefit your team? I've attached my resume for your review.\n\nThank you for your consideration,\n[Your Name]`;
        break;
        
      default:
        subject = `Connecting with ${company}`;
        body = `Hello ${name},\n\nI hope this email finds you well. I'm reaching out because I recently came across ${company} and was impressed by [specific detail].\n\nAs a ${role}, I thought you might be interested in [value proposition].\n\nI'd love to schedule a quick call to discuss how we might work together.\n\nBest regards,\n[Your Name]`;
    }
    
    return { subject, body };
  }
});
