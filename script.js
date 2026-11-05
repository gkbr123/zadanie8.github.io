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

    // Вставьте сюда свой адрес Formcarry.
    var endpoint = "https://formcarry.com/s/YOUR-FORM-ID";

    var modalIsOpen = false;

    var fields = [
        "fullname",
        "email",
        "phone",
        "organization",
        "message"
    ];

    // Открытие модального окна.
    function showModal() {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        modalIsOpen = true;

        document.body.classList.add("modal-active");
        openButton.setAttribute("aria-expanded", "true");

        document.getElementById("fullname").focus();
    }

    // Закрытие модального окна.
    function hideModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        modalIsOpen = false;

        document.body.classList.remove("modal-active");
        openButton.setAttribute("aria-expanded", "false");
    }

    // Открытие с изменением URL.
    function openForm() {
        if (modalIsOpen) {
            return;
        }

        var url = new URL(window.location.href);
        url.searchParams.set("contact", "1");

        window.history.pushState(
            { contactModal: true },
            "",
            url
        );

        showModal();
    }

    // Закрытие с использованием History API.
    function closeForm() {
        if (!modalIsOpen) {
            return;
        }

        if (window.history.state &&
            window.history.state.contactModal) {
            window.history.back();
        } else {
            var url = new URL(window.location.href);
            url.searchParams.delete("contact");

            window.history.replaceState(
                window.history.state,
                "",
                url
            );

            hideModal();
        }
    }

    // Вывод ошибки.
    function showError(fieldName, message) {
        var field = document.getElementById(fieldName);
        var error = document.getElementById(
            fieldName + "-error"
        );

        error.textContent = message;
        field.classList.add("input-error");
    }

    // Удаление ошибки.
    function clearError(fieldName) {
        var field = document.getElementById(fieldName);
        var error = document.getElementById(
            fieldName + "-error"
        );

        error.textContent = "";
        field.classList.remove("input-error");
    }

    // Проверка всех полей формы.
    function validateForm() {
        var valid = true;

        var fullname = form.elements.fullname.value.trim();
        var email = form.elements.email.value.trim();
        var phone = form.elements.phone.value.trim();
        var organization =
            form.elements.organization.value.trim();
        var message = form.elements.message.value.trim();
        var consent = form.elements.consent.checked;

        fields.forEach(function (fieldName) {
            clearError(fieldName);
        });

        document.getElementById("consent-error").textContent = "";

        // ФИО: только буквы, пробелы и дефисы.
        // Минимум два слова.
        var namePattern =
            /^[A-Za-zА-Яа-яЁё]+(?:[- ][A-Za-zА-Яа-яЁё]+)+$/;

        if (!namePattern.test(fullname)) {
            showError(
                "fullname",
                "Введите ФИО буквами, минимум два слова."
            );
            valid = false;
        }

        // Электронная почта.
        var emailPattern =
            /^[^\s@]+@[^\s@]+\.[A-Za-zА-Яа-яЁё]{2,}$/;

        if (!emailPattern.test(email)) {
            showError(
                "email",
                "Введите корректный адрес электронной почты."
            );
            valid = false;
        }

        // Телефон: от 10 до 15 цифр, плюс только в начале.
        var phonePattern = /^\+?[0-9]{10,15}$/;

        if (!phonePattern.test(phone)) {
            showError(
                "phone",
                "Введите телефон: от 10 до 15 цифр."
            );
            valid = false;
        }

        // Организация.
        if (organization.length === 0) {
            showError(
                "organization",
                "Введите название организации."
            );
            valid = false;
        } else if (organization.length > 100) {
            showError(
                "organization",
                "Максимальная длина — 100 символов."
            );
            valid = false;
        }

        // Сообщение.
        if (message.length < 10) {
            showError(
                "message",
                "Сообщение должно содержать минимум 10 символов."
            );
            valid = false;
        } else if (message.length > 1000) {
            showError(
                "message",
                "Максимальная длина сообщения — 1000 символов."
            );
            valid = false;
        }

        // Согласие на обработку данных.
        if (!consent) {
            document.getElementById("consent-error")
                .textContent =
                "Необходимо согласиться на обработку данных.";

            valid = false;
        }

        return valid;
    }

    // Сохранение данных в LocalStorage.
    function saveFormData() {
        var formData = {
            fullname: form.elements.fullname.value,
            email: form.elements.email.value,
            phone: form.elements.phone.value,
            organization: form.elements.organization.value,
            message: form.elements.message.value,
            consent: form.elements.consent.checked
        };

        localStorage.setItem(
            storageKey,
            JSON.stringify(formData)
        );
    }

    // Восстановление данных из LocalStorage.
    function restoreFormData() {
        var savedData = localStorage.getItem(storageKey);
        var formData;

        if (!savedData) {
            return;
        }

        try {
            formData = JSON.parse(savedData);

            fields.forEach(function (fieldName) {
                form.elements[fieldName].value =
                    formData[fieldName] || "";
            });

            form.elements.consent.checked =
                Boolean(formData.consent);
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
    }

    // Отображение результата отправки.
    function showStatus(message, type) {
        status.textContent = message;
        status.className = "form-status " + type;
    }

    // Удаление ошибки при изменении поля.
    fields.forEach(function (fieldName) {
        form.elements[fieldName].addEventListener(
            "input",
            function () {
                clearError(fieldName);
            }
        );
    });

    form.elements.consent.addEventListener(
        "change",
        function () {
            document.getElementById("consent-error")
                .textContent = "";
        }
    );

    // Обработчики кнопок.
    openButton.addEventListener("click", openForm);
    closeButton.addEventListener("click", closeForm);
    overlay.addEventListener("click", closeForm);

    // Закрытие при нажатии кнопки браузера "Назад".
    window.addEventListener("popstate", function () {
        if (modalIsOpen) {
            hideModal();
        }
    });

    // Закрытие клавишей Escape.
    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modalIsOpen) {
            closeForm();
        }
    });

    // Автоматическое сохранение введённых данных.
    form.addEventListener("input", saveFormData);
    form.addEventListener("change", saveFormData);

    // Отправка формы.
    form.addEventListener("submit", function (event) {
        var formData;
        var data;

        event.preventDefault();

        // Сначала проверяем правильность заполнения.
        if (!validateForm()) {
            showStatus(
                "Проверьте правильность заполнения полей.",
                "error"
            );
            return;
        }

        // Проверяем наличие адреса Formcarry.
        if (endpoint.indexOf("YOUR-FORM-ID") !== -1) {
            showStatus(
                "Укажите адрес формы Formcarry в script.js.",
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
                    throw new Error("Ошибка сервера");
                }

                return response.json();
            })
            .then(function () {
                form.reset();

                localStorage.removeItem(storageKey);

                fields.forEach(function (fieldName) {
                    clearError(fieldName);
                });

                document.getElementById("consent-error")
                    .textContent = "";

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

    // Восстанавливаем сохранённые данные.
    restoreFormData();

    // Если в URL уже есть параметр contact=1,
    // открываем форму автоматически.
    if (new URL(window.location.href)
        .searchParams.get("contact") === "1") {
        showModal();
    }
});
