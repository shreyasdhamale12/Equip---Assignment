document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Clear any previous errors
    document.querySelectorAll('.error').forEach(function(el) {
        el.style.display = 'none';
    });

    let valid = true;

    // Validate first name
    const firstName = document.getElementById('first-name').value;
    if (!firstName) {
        document.getElementById('first-name-error').style.display = 'block';
        valid = false;
    }

    // Validate last name
    const lastName = document.getElementById('last-name').value;
    if (!lastName) {
        document.getElementById('last-name-error').style.display = 'block';
        valid = false;
    }

    // Validate mobile number
    const mobileNumber = document.getElementById('mobile-number').value;
    if (!/^\d{10}$/.test(mobileNumber)) {
        document.getElementById('mobile-error').style.display = 'block';
        valid = false;
    }

    // Validate password
    const password = document.getElementById('password').value;
    if (password.length < 6) {
        document.getElementById('password-error').style.display = 'block';
        valid = false;
    }

    if (valid) {
        alert('Registration successful!');
        // Perform form submission or API call
    }
});