import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginImage from '../../assets/images/Whimsical Floating Plushie Dreamscape.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const Login = () => {
  const navigate = useNavigate()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const formData = new FormData(formElement)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })
      const responseText = await response.text()
      let responseData = null

      if (responseText) {
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = null
        }
      }

      if (!response.ok) {
        throw new Error(responseData?.message || `Login failed (${response.status}).`)
      }

      navigate('/home', { replace: true, state: { user: responseData?.data?.user } })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const accountDetails = Object.fromEntries(new FormData(formElement).entries())

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountDetails),
      })
      const responseText = await response.text()
      let responseData = null

      if (responseText) {
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = null
        }
      }

      if (!response.ok) {
        throw new Error(responseData?.message || `Account creation failed (${response.status}).`)
      }

      formElement.reset()
      setSuccessMessage('Your account has been created. You can now log in.')
      setIsCreatingAccount(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='min-h-screen bg-black p-4 sm:p-6 lg:p-8 flex items-center justify-center'>
      <div className='mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white md:grid-cols-2'>
        
        {/* Left image panel */}
        <section className='relative min-h-[280px] overflow-hidden bg-stone-900 md:min-h-[580px]' aria-label='Welcome illustration'>
          <img
            src={loginImage}
            alt='A dreamy, whimsical plushie floating through a colorful sky'
            className='absolute inset-0 h-full w-full object-cover object-center brightness-95'
          />
          {/* Warm gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30' />
          
          {/* Brand header */}
          <div className='absolute inset-x-0 top-0 flex items-center gap-2.5 p-6 text-lg font-semibold tracking-wide text-white sm:p-8'>
            <span className='tracking-tight'>Stream</span>
          </div>

          {/* Bottom caption */}
          <div className='absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10'>
            <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-rose-300'>Your space, your stories</p>
            <h1 className='max-w-md text-2xl font-semibold leading-snug sm:text-3xl tracking-tight'>
              Find your people. Stay in the moment.
            </h1>
          </div>
        </section>

        {/* Right form panel */}
        <section className='flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12'>
          <div className='w-full max-w-sm'>
            <div className='mb-12 text-center'>
              <h2 className='text-3xl font-bold tracking-tight text-stone-900'>
                {isCreatingAccount ? 'Create your account' : 'Welcome Back!'}
              </h2>
              <p className='mt-2 text-sm text-stone-500'>
                {isCreatingAccount ? 'Join Stream and make yourself at home.' : 'Enter your details below.'}
              </p>
            </div>

            <form onSubmit={isCreatingAccount ? handleRegister : handleLogin} className='space-y-4'>
              {isCreatingAccount && (
                <>
                  <div>
                    <label htmlFor='fullName' className='mb-2 block text-xs font-semibold text-stone-700'>Full name</label>
                    <input
                      id='fullName'
                      name='fullName'
                      type='text'
                      autoComplete='name'
                      placeholder='Your full name'
                      required
                      className='w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                    />
                  </div>
                  <div>
                    <label htmlFor='username' className='mb-2 block text-xs font-semibold text-stone-700'>Username</label>
                    <input
                      id='username'
                      name='username'
                      type='text'
                      autoComplete='username'
                      placeholder='Choose a username'
                      required
                      className='w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor='email' className='mb-2 block text-xs font-semibold text-stone-700'>
                  {isCreatingAccount ? 'Email address' : 'Username or email address'}
                </label>
                <input
                  id='email'
                  name={isCreatingAccount ? 'email' : 'username'}
                  type={isCreatingAccount ? 'email' : 'text'}
                  autoComplete={isCreatingAccount ? 'email' : 'username'}
                  placeholder={isCreatingAccount ? 'you@example.com' : 'Your username or email'}
                  required
                  className='w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                />
              </div>

              {errorMessage && (
                <p role='alert' className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p role='status' className='rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700'>
                  {successMessage}
                </p>
              )}

              {isCreatingAccount ? (
                <div>
                  <label htmlFor='password' className='mb-2 block text-xs font-semibold text-stone-700'>Password</label>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='new-password'
                    placeholder='Create a password'
                    required
                    className='w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                  />
                </div>
              ) : (
              <div>
                <label htmlFor='password' className='mb-2 block text-xs font-semibold text-stone-700'>Password</label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  placeholder='Enter your password'
                  required
                  className='w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                />
              </div>
              )}

              {!isCreatingAccount && (
                <div className='flex items-center justify-between gap-4 pt-1 text-xs'>
                  <label className='flex cursor-pointer select-none items-center gap-2 text-stone-600'>
                    <input
                      type='checkbox'
                      name='remember'
                      className='h-4 w-4 rounded border-stone-300 accent-black'
                    />
                    Remember me
                  </label>
                  <button type='button' className='font-medium text-stone-500 transition hover:text-rose-600'>
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full cursor-pointer rounded-full bg-black px-4 py-3.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-wait disabled:opacity-60'
              >
                {isSubmitting ? (isCreatingAccount ? 'Creating account...' : 'Signing in...') : isCreatingAccount ? 'Create account' : 'Log in'}
              </button>
            </form>

            <p className='mt-7 text-center text-xs text-stone-500'>
              {isCreatingAccount ? 'Already have an account? ' : 'New to Stream? '}
              <button
                type='button'
                onClick={() => {
                  setIsCreatingAccount(!isCreatingAccount)
                  setErrorMessage('')
                  setSuccessMessage('')
                }}
                className='font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-rose-600 hover:decoration-rose-600'
              >
                {isCreatingAccount ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login