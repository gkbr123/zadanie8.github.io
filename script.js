"use strict";

document.addEventListener("DOMContentLoaded", function () {
    var openButton = document.getElementById("open-form");
    var closeButton = document.getElementById("close-form");
    var overlay = document.getElementById("modal-overlay");
    var modal = document.getElementById("contact-modal");
    var form = document.getElementById("contact-form");
    var submitButton = document.getElementById("submit-button");
    var status = document.getElementById("form-status");

    var storageKey = "contactFormData";
    var endpoint = "https://formcarry.com/s/YOUR-FORM-ID";
    var modalIsOpen = false;

    function showModal() {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        modalIsOpen = true;
        document.body.classList.add("modal-active");
        openButton.setAttribute("aria-expanded", "true");
        document.getElementById("fullname").focus();
    }

    function hideModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modalIsOpen = false;
        document.body.classList.remove("modal-active");
        openButton.setAttribute("aria-expanded", "false");
    }

    function openForm() {
        if (modalIsOpen) {
            return;
        }

        window.history.pushState(
            { contactModal: true },
            "",
            window.location.pathname + "?contact=1"
        );

        showModal();
    }

    function closeForm() {
        if (!modalIsOpen) {
            return;
        }

        if (window.history.state &&
                window.history.state.contactModal) {
            window.history.back();
        } else {
            hideModal();
        }
    }

    function saveFormData() {
        var formData = {
            fullname: form.elements.fullname.value,
            email: form.elements.email.value,
            phone: form.elements.phone.value,
            organization: form.elements.organization.value,
            message: form.elements.message.value,
            consent: form.elements.consent.checked
        };

        localStorage.setItem(storageKey, JSON.stringify(formData));
    }

    function restoreFormData() {
        var savedData = localStorage.getItem(storageKey);
        var formData;

        if (!savedData) {
            return;
        }

        try {
            formData = JSON.parse(savedData);

            form.elements.fullname.value = formData.fullname || "";
            form.elements.email.value = formData.email || "";
            form.elements.phone.value = formData.phone || "";
            form.elements.organization.value =
                formData.organization || "";
            form.elements.message.value = formData.message || "";
            form.elements.consent.checked =
                Boolean(formData.consent);
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = "form-status " + type;
    }

    openButton.addEventListener("click", openForm);
    closeButton.addEventListener("click", closeForm);
    overlay.addEventListener("click", closeForm);

    window.addEventListener("popstate", function () {
        if (modalIsOpen) {
            hideModal();
        }
    });

    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modalIsOpen) {
            closeForm();
        }
    });

    form.addEventListener("input", saveFormData);
    form.addEventListener("change", saveFormData);

    form.addEventListener("submit", function (event) {
        var formData;
        var data;

        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (endpoint.indexOf("YOUR-FORM-ID") !== -1) {
            showStatus(
                "Сначала укажите адрес своей формы Formcarry в script.js.",
                "error"
            );
            return;
        }

        formData = new FormData(form);
        data = {};

        formData.forEach(function (value, key) {
            data[key] = value;
        });

        submitButton.disabled = true;
        submitButton.textContent = "Отправка...";
        showStatus("Отправляем сообщение...", "");

        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Ошибка сервера: " + response.status);
                }

                return response.json();
            })
            .then(function () {
                form.reset();
                localStorage.removeItem(storageKey);

                showStatus(
                    "Сообщение успешно отправлено!",
                    "success"
                );
            })
            .catch(function () {
                showStatus(
                    "Не удалось отправить сообщение. Попробуйте ещё раз.",
                    "error"
                );
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = "Отправить";
            });
    });

    restoreFormData();

    if (window.location.search.indexOf("contact=1") !== -1) {
        showModal();
    }
});
