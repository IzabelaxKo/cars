export default function Navbar(){
  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top w-100 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-75">
      <div className="container-fluid px-4 px-lg-5 py-2">
        <a className="navbar-brand fw-bold text-uppercase" href="/">
          Car Rental
        </a>
        <a className="btn btn-outline-light btn-sm rounded-pill px-4 fw-semibold" href="/admin">
          Admin Panel
        </a>
      </div>
    </nav>
  )
}
