export default function Navbar() {
  const isAdminUser = localStorage.getItem('role') === 'admin' || localStorage.getItem('userRole') === 'admin' || localStorage.getItem('isAdmin') === 'true'

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top w-100 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-75">
      <div className="container-fluid px-4 px-lg-5 py-2">
        <a className="navbar-brand fw-bold text-uppercase" href="/">
          Car Rental
        </a>
        <div className="d-flex flex-wrap gap-2">
          <a className="btn btn-outline-light btn-sm rounded-pill px-4 fw-semibold" href="/register">
            Register
          </a>
          <a className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold" href="/login">
            Login
          </a>
          {isAdminUser ? (
            <a className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold text-white border-secondary" href="/admin">
              Admin Panel
            </a>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
