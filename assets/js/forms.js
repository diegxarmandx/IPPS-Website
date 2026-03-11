(function () {
  const recipientEmail = "ippspr@gmail.com";
  const formsubmitEndpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`;

  const forms = [
    {
      id: "contactForm",
      successMessage: "Your message was sent successfully. Our team will contact you shortly.",
      mailSubjectPrefix: "IPPS Website Contact",
      endpoint: formsubmitEndpoint
    },
    {
      id: "quoteForm",
      successMessage: "Your quote request was sent successfully. We will follow up with next steps.",
      mailSubjectPrefix: "IPPS Website Quote Request",
      endpoint: formsubmitEndpoint
    }
  ];

  function renderStatus(container, type, message) {
    container.innerHTML = `<div class="alert alert-${type}" role="status">${message}</div>`;
  }

  function toLabel(fieldName) {
    const labels = {
      name: "Name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      subject: "Subject",
      message: "Message",
      industry: "Industry",
      products: "Product(s) of Interest",
      volume: "Quantity / Estimated Volume",
      application: "Application / Use Case",
      details: "Additional Details"
    };
    return labels[fieldName] || fieldName;
  }

  function buildFormPayload(formConfig, formData) {
    const entries = Array.from(formData.entries()).filter(([, value]) => value && value.toString().trim());
    const formValues = Object.fromEntries(entries);
    const suffix = formValues.subject || formValues.company || formValues.name || "New Inquiry";
    const subject = `${formConfig.mailSubjectPrefix}: ${suffix}`;
    const messageBody = entries.map(([key, value]) => `${toLabel(key)}: ${value}`).join("\n");

    return {
      _subject: subject,
      _template: "table",
      _captcha: "false",
      message: messageBody,
      ...Object.fromEntries(entries)
    };
  }

  async function submitForm(formConfig, formElement, formData) {
    const payload = buildFormPayload(formConfig, formData);

    const response = await fetch(formConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Submission failed with status ${response.status}`);
    }

    const responseData = await response.json().catch(() => ({}));
    if (responseData && responseData.success === false) {
      throw new Error(responseData.message || "Submission failed");
    }

    return { ok: true };
  }

  forms.forEach((formConfig) => {
    const form = document.getElementById(formConfig.id);
    if (!form) return;

    const status = form.querySelector(".status-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        renderStatus(status, "danger", "Please fix the highlighted fields and try again.");
        return;
      }

      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      renderStatus(status, "info", "Submitting your request...");

      try {
        const formData = new FormData(form);
        await submitForm(formConfig, form, formData);
        renderStatus(status, "success", formConfig.successMessage);
        form.reset();
        form.classList.remove("was-validated");
      } catch (error) {
        renderStatus(status, "danger", "Submission failed. Please try again or contact us directly.");
        console.error(error);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = formConfig.id === "quoteForm" ? "Submit Quote Request" : "Send Message";
      }
    });
  });
})();
