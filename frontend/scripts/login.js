/*=============== SHOW HIDE PASSWORD LOGIN ===============*/
const passwordAccess = (loginPass, loginEye) =>{
    const input = document.getElementById(loginPass),
        iconEye = document.getElementById(loginEye)

    iconEye.addEventListener('click', () =>{
        // Change password to text
        input.type === 'password' ? input.type = 'text'
            : input.type = 'password'

        // Icon change
        iconEye.classList.toggle('ri-eye-fill')
        iconEye.classList.toggle('ri-eye-off-fill')
    })
}
passwordAccess('password','loginPassword')

/*=============== SHOW HIDE PASSWORD CREATE ACCOUNT ===============*/
const passwordRegister = (loginPass, loginEye) =>{
    const input = document.getElementById(loginPass),
        iconEye = document.getElementById(loginEye)

    iconEye.addEventListener('click', () =>{
        // Change password to text
        input.type === 'password' ? input.type = 'text'
            : input.type = 'password'

        // Icon change
        iconEye.classList.toggle('ri-eye-fill')
        iconEye.classList.toggle('ri-eye-off-fill')
    })
}
passwordRegister('passwordCreate','loginPasswordCreate')

/*=============== SHOW HIDE LOGIN & CREATE ACCOUNT ===============*/
const loginAcessRegister = document.getElementById('loginAccessRegister'),
    buttonRegister = document.getElementById('loginButtonRegister'),
    buttonAccess = document.getElementById('loginButtonAccess')

buttonRegister.addEventListener('click', () => {
    loginAcessRegister.classList.add('active')
})

buttonAccess.addEventListener('click', () => {
    loginAcessRegister.classList.remove('active')
})

// Add function to show error popup
function showErrorPopup(message) {
    const popup = document.createElement('div')
    popup.classList.add('error-popup')
    popup.textContent = message
    document.body.appendChild(popup)

    setTimeout(() => {
        popup.remove()
    }, 3000)
}

document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.querySelector('.login__register .login__form')

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const name = document.getElementById('names').value
        const surname = document.getElementById('surnames').value
        const email = document.getElementById('emailCreate').value
        const password = document.getElementById('passwordCreate').value

        try {
            const response = await fetch('http://127.0.0.1:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, surname, email, password })
            })

            const data = await response.json()
            if (response.ok) {
                console.log('Registration successful', data);
                localStorage.setItem('token', data.token);
                window.location.href = './dashboard.html';
            } else {
                showErrorPopup(data.msg);
                console.error('Registration failed', data.msg);
            }
        } catch (error) {
            console.error('Error:', error)
            showErrorPopup('An unexpected error occurred.')
        }
    })

    // Login form submission
    const loginForm = document.querySelector('.login__access .login__form')

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        try {
            const response = await fetch('http://127.0.0.1:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()
            if (response.ok) {
                console.log('Login successful', data)
                localStorage.setItem('token', data.token)
                window.location.href = './dashboard.html' // Corrected path
            } else {
                showErrorPopup(data.msg)
                console.error('Login failed', data.msg)
            }
        } catch (error) {
            console.error('Error:', error)
            showErrorPopup('An unexpected error occurred.')
        }
    })
})