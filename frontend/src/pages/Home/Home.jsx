import { useLocation, useNavigate } from 'react-router-dom'

const Home = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const user = state?.user
  const name = user?.fullName || user?.username

  return (
    <main className='flex min-h-screen items-center justify-center bg-stone-100 px-6 py-12'>
      <section className='w-full max-w-2xl rounded-[2rem] bg-white px-8 py-12 text-center shadow-xl shadow-stone-200/70 sm:px-14 sm:py-16'>
        <p className='text-sm font-semibold uppercase tracking-[0.2em] text-rose-600'>Stream</p>
        <h1 className='mt-5 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
          {name ? `Welcome, ${name}!` : 'Welcome to Stream!'}
        </h1>
        <p className='mx-auto mt-4 max-w-md text-base leading-7 text-stone-500'>
          You’re signed in. Your space and stories are waiting for you.
        </p>
        <button
          type='button'
          onClick={() => navigate('/login', { replace: true })}
          className='mt-8 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-300'
        >
          Continue
        </button>
      </section>
    </main>
  )
}

export default Home
