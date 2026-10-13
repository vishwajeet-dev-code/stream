import backgroundImage from '../../../src/assets/images/landing-page-background.png'
import './LandingPage.css'

const LandingPage = () => {
    return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="min-h-screen bg-black/40">

      {/* NAVBAR */}
        <nav className="flex items-center justify-between p-8 text-white">
          <h1 className="text-4xl font-bold">Stream</h1>
        </nav>

      {/* MIDDLE SLOGAN + TEXT */}
        <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="landing-text landing-heading text-4xl font-bold md:text-6xl">
            Made by Creators.
            <br />
            Watched by Everyone.
          </h2>

          <p className="landing-text landing-description mt-5 text-gray-300">
            Discover videos, explore new perspectives, and find <br/>
            the content that moves you.
          </p>

          <button 
          className="landing-text landing-cta mt-8 cursor-pointer rounded-sm bg-red-500 px-10 
          py-3 text-xl font-semibold hover:bg-red-600">
            Get Started
          </button>
        </main>
      </div>
    </div>
  );
}

export default LandingPage