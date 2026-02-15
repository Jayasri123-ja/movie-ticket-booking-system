// Global variables
let currentUser = null;
let selectedMovie = null;
let selectedShow = null;
let selectedSeats = [];
let movies = [];

// API Base URL - Make sure this matches your backend
const API_BASE_URL = 'http://localhost:8080/api';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, fetching movies from:', API_BASE_URL);
    checkLoggedInUser();
    fetchMovies();
});

// Fetch movies from backend
async function fetchMovies() {
    try {
        console.log('Fetching movies...');
        
        const response = await fetch(`${API_BASE_URL}/movies`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Movies received:', data);
        
        if (data && data.length > 0) {
            movies = data;
            displayMovies(movies);
        } else {
            document.getElementById('moviesGrid').innerHTML = '<div class="loading">No movies found</div>';
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        // Show error but also load sample data so user can see something
        document.getElementById('moviesGrid').innerHTML = `
            <div class="loading" style="color: #dc3545;">
                <i class="fas fa-exclamation-circle"></i>
                Error loading movies: ${error.message}
            </div>
        `;
    }
}

// Display movies in grid
// Display movies in grid
function displayMovies(moviesToShow) {
    const moviesGrid = document.getElementById('moviesGrid');
    
    if (!moviesToShow || moviesToShow.length === 0) {
        moviesGrid.innerHTML = '<div class="loading">No movies found</div>';
        return;
    }
    
    moviesGrid.innerHTML = moviesToShow.map(movie => `
        <div class="movie-card" onclick="showMovieDetails('${movie.id}')">
            <div class="movie-poster">
                <img src="${movie.posterUrl || 'https://via.placeholder.com/300x400?text=' + encodeURIComponent(movie.title)}" 
                     alt="${movie.title}" 
                     onerror="this.src='https://via.placeholder.com/300x400?text=' + encodeURIComponent('${movie.title}') + '&bg=667eea&fg=white'">
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span><i class="fas fa-clock"></i> ${movie.duration} min</span>
                    <span><i class="fas fa-language"></i> ${movie.language || 'N/A'}</span>
                </div>
                <div class="rating">
                    <i class="fas fa-star"></i> ${movie.rating || 'N/A'}
                </div>
                <button class="btn-book" onclick="event.stopPropagation(); showMovieDetails('${movie.id}')">
                    <i class="fas fa-ticket-alt"></i> Book Now
                </button>
            </div>
        </div>
    `).join('');
}

// Show movie details
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        
        const movie = await response.json();
        selectedMovie = movie;
        
        const modal = document.getElementById('movieModal');
        const detailDiv = document.getElementById('movieDetail');
        
        detailDiv.innerHTML = `
            <div class="movie-detail">
                <div class="movie-detail-poster">
                    <img src="${movie.posterUrl || 'https://via.placeholder.com/300x400?text=No+Poster'}" 
                         alt="${movie.title}"
                         onerror="this.src='https://via.placeholder.com/300x400?text=Movie+Poster'">
                </div>
                <div class="movie-detail-info">
                    <h2>${movie.title}</h2>
                    <div class="movie-detail-meta">
                        <p><i class="fas fa-film"></i> ${movie.genre || 'N/A'}</p>
                        <p><i class="fas fa-clock"></i> ${movie.duration} min</p>
                        <p><i class="fas fa-language"></i> ${movie.language}</p>
                        <p><i class="fas fa-star" style="color: #ffc107;"></i> ${movie.rating || 'N/A'}</p>
                    </div>
                    <p class="description">${movie.description || 'No description available.'}</p>
                    
                    <div class="shows-section">
                        <h3>Available Shows</h3>
                        <div class="shows-grid">
                            ${movie.shows && movie.shows.length > 0 ? 
                                movie.shows.map(show => `
                                    <div class="show-card">
                                        <div class="show-time">
                                            <i class="far fa-clock"></i> 
                                            ${new Date(show.showTime).toLocaleTimeString()}
                                        </div>
                                        <div class="theater-name">
                                            <i class="fas fa-building"></i> ${show.theaterName}
                                        </div>
                                        <div class="seats-info">
                                            <span><i class="fas fa-chair"></i> ${show.availableSeats}/${show.totalSeats}</span>
                                            <span class="price">₹${show.price}</span>
                                        </div>
                                        <button class="btn-select-show" 
                                                onclick="selectShow('${show.id}')"
                                                ${show.availableSeats === 0 ? 'disabled' : ''}>
                                            ${show.availableSeats === 0 ? 'Housefull' : 'Select Seats'}
                                        </button>
                                    </div>
                                `).join('') 
                                : '<p>No shows available</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load movie details');
    }
}

// Select show for booking
function selectShow(showId) {
    if (!currentUser) {
        closeModal();
        showLoginModal();
        showToast('Please login to continue');
        return;
    }
    
    selectedShow = selectedMovie.shows.find(s => s.id === showId);
    selectedSeats = [];
    showBookingModal();
}

// Show booking modal
function showBookingModal() {
    const modal = document.getElementById('bookingModal');
    const detailDiv = document.getElementById('bookingDetail');
    
    // Generate seats if not exists
    if (!selectedShow.seats || selectedShow.seats.length === 0) {
        selectedShow.seats = generateSeats(selectedShow.totalSeats);
    }
    
    detailDiv.innerHTML = `
        <h2>Select Your Seats</h2>
        <div class="booking-info">
            <p><i class="fas fa-film"></i> ${selectedMovie.title}</p>
            <p><i class="fas fa-building"></i> ${selectedShow.theaterName}</p>
            <p><i class="far fa-clock"></i> ${new Date(selectedShow.showTime).toLocaleString()}</p>
        </div>
        
        <div class="seat-selection">
            <div class="seat-legend">
                <div class="legend-item">
                    <div class="legend-color available"></div>
                    <span>Available</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color selected"></div>
                    <span>Selected</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color booked"></div>
                    <span>Booked</span>
                </div>
            </div>
            
            <div class="seat-grid" id="seatGrid">
                ${renderSeats(selectedShow.seats)}
            </div>
        </div>
        
        <div class="booking-summary">
            <p><span>Selected Seats:</span> <span id="selectedSeats">${selectedSeats.join(', ') || 'None'}</span></p>
            <p><span>Total Amount:</span> <span id="totalAmount">₹0</span></p>
        </div>
        
        <button class="btn-confirm-booking" onclick="confirmBooking()" ${selectedSeats.length === 0 ? 'disabled' : ''}>
            Confirm Booking
        </button>
    `;
    
    modal.style.display = 'block';
}

// Generate seats
function generateSeats(count) {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let seatCount = 0;
    
    for (let row of rows) {
        for (let i = 1; i <= 10; i++) {
            if (seatCount >= count) break;
            seats.push({
                seatNumber: `${row}${i}`,
                isBooked: Math.random() > 0.7
            });
            seatCount++;
        }
        if (seatCount >= count) break;
    }
    
    return seats;
}

// Render seats
function renderSeats(seats) {
    return seats.map(seat => {
        const isSelected = selectedSeats.includes(seat.seatNumber);
        const seatClass = seat.isBooked ? 'booked' : (isSelected ? 'selected' : 'available');
        
        return `
            <div class="seat ${seatClass}" 
                 onclick="${!seat.isBooked ? `toggleSeat('${seat.seatNumber}')` : ''}">
                ${seat.seatNumber}
            </div>
        `;
    }).join('');
}

// Toggle seat selection
function toggleSeat(seatNumber) {
    if (selectedSeats.includes(seatNumber)) {
        selectedSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
        selectedSeats.push(seatNumber);
    }
    
    const seatGrid = document.getElementById('seatGrid');
    if (seatGrid) {
        seatGrid.innerHTML = renderSeats(selectedShow.seats);
    }
    
    document.getElementById('selectedSeats').textContent = selectedSeats.join(', ') || 'None';
    document.getElementById('totalAmount').textContent = `₹${selectedSeats.length * selectedShow.price}`;
    
    const confirmBtn = document.querySelector('.btn-confirm-booking');
    if (confirmBtn) {
        confirmBtn.disabled = selectedSeats.length === 0;
    }
}

// Confirm booking
async function confirmBooking() {
    if (!currentUser || selectedSeats.length === 0) return;
    
    const booking = {
        movieId: selectedMovie.id,
        showId: selectedShow.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone,
        seatNumbers: selectedSeats,
        totalAmount: selectedSeats.length * selectedShow.price
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });
        
        if (!response.ok) throw new Error('Booking failed');
        
        const result = await response.json();
        showToast('Booking successful! Check your email for confirmation.');
        closeBookingModal();
        closeModal();
        fetchMovies();
    } catch (error) {
        console.error('Error:', error);
        showToast('Booking failed. Please try again.');
    }
}

// Login functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    
    currentUser = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateLoginButton();
    closeLoginModal();
    showToast(`Welcome, ${currentUser.name}!`);
}

function checkLoggedInUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateLoginButton();
    }
}

function updateLoginButton() {
    const loginBtn = document.querySelector('.btn-login');
    if (currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name.split(' ')[0]}`;
        loginBtn.onclick = () => showToast(`Logged in as ${currentUser.name}`);
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.onclick = showLoginModal;
    }
}

// Modal close functions
function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Search movies
function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm)
    );
    displayMovies(filteredMovies);
}

// Filter movies
function filterMovies() {
    const genre = document.getElementById('genreFilter').value;
    const language = document.getElementById('languageFilter').value;
    
    let filtered = movies;
    
    if (genre) {
        filtered = filtered.filter(movie => movie.genre === genre);
    }
    
    if (language) {
        filtered = filtered.filter(movie => movie.language === language);
    }
    
    displayMovies(filtered);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const movieModal = document.getElementById('movieModal');
    const bookingModal = document.getElementById('bookingModal');
    const loginModal = document.getElementById('loginModal');
    
    if (event.target === movieModal) {
        movieModal.style.display = 'none';
    }
    if (event.target === bookingModal) {
        bookingModal.style.display = 'none';
    }
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
}