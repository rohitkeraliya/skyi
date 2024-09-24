 document.addEventListener('DOMContentLoaded', function () {
            const itemsPerPage = 5;
            let currentPage = 1;
            let totalItems = 0;
            let isLoading = false;
            let sheetData = [];
            let displayedItems = [];
            let videos = [];

            const loadingElement = document.getElementById('loading');
            const searchInput = document.getElementById('searchInput');
            const suggestionsList = document.getElementById('suggestions');
            const clearButton = document.getElementById('clearButton');
            const closeButton = document.getElementById('closeButton');
            const allButton = document.getElementById('allButton');
            const rohitButton = document.getElementById('rohitButton');

            // Load initial data on page load
            fetchData('https://docs.google.com/spreadsheets/d/1JPptsNfP9Qw0ndxXq8DVd8LW6mCQm_aiO98iVNvs53M/gviz/tq?tqx=out:csv&sheet=Sheet1&tq=SELECT *');

            allButton.addEventListener('click', function () {
                showLoading();
                currentPage = 1;
                displayedItems = [];
                fetchData('https://docs.google.com/spreadsheets/d/1JPptsNfP9Qw0ndxXq8DVd8LW6mCQm_aiO98iVNvs53M/gviz/tq?tqx=out:csv&sheet=Sheet1&tq=SELECT *');
            });

            rohitButton.addEventListener('click', function () {
                showLoading();
                currentPage = 1;
                displayedItems = [];
                fetchData("https://docs.google.com/spreadsheets/d/1JPptsNfP9Qw0ndxXq8DVd8LW6mCQm_aiO98iVNvs53M/gviz/tq?tqx=out:csv&sheet=Sheet1&tq=SELECT * WHERE B = 'rohit'");
            });

            searchInput.addEventListener('focus', function () {
                if (searchInput.value.trim().length >= 1) {
                    updateSuggestions(searchInput.value.trim().toLowerCase());
                }
            });

            searchInput.addEventListener('input', function () {
                updateSuggestions(searchInput.value.trim().toLowerCase());
            });

            closeButton.addEventListener('click', function () {
                suggestionsList.style.display = 'none';
                searchInput.blur();
            });

            clearButton.addEventListener('click', function () {
                searchInput.value = '';
                suggestionsList.style.display = 'none';
                currentPage = 1;
                displayedItems = [];
                fetchData('https://docs.google.com/spreadsheets/d/1JPptsNfP9Qw0ndxXq8DVd8LW6mCQm_aiO98iVNvs53M/gviz/tq?tqx=out:csv&sheet=Sheet1&tq=SELECT *');
            });

            function showLoading() {
                isLoading = true;
                loadingElement.style.display = 'flex';
                setTimeout(function () {
                    hideLoading();
                }, 1000);
            }

            function hideLoading() {
                isLoading = false;
                loadingElement.style.display = 'none';
            }

            function fetchSheetData() {
                const sheetUrl = 'https://docs.google.com/spreadsheets/d/1ljFYrBKFviYTJ66P_WJ4z3SSDFZRqMDd5QwRX77fnBs/gviz/tq?tqx=out:csv&sheet=Sheet1&tq=SELECT *';
                fetch(sheetUrl)
                    .then(response => response.text())
                    .then(csvData => {
                        sheetData = csvData.trim().split('\n').map(row => row.replace(/"/g, '').trim());
                    })
                    .catch(error => console.error('Error fetching sheet data:', error));
            }

            function updateSuggestions(inputValue) {
                if (inputValue === '') {
                    suggestionsList.style.display = 'none';
                    return;
                }

                const filteredSuggestions = sheetData
                    .flatMap(row => row.split(','))
                    .map(name => name.trim())
                    .filter(name => name.toLowerCase().includes(inputValue));

                suggestionsList.innerHTML = '';
                filteredSuggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion;
                    li.addEventListener('click', function () {
                        searchInput.value = suggestion;
                        showLoading();
                        currentPage = 1;
                        displayedItems = [];
                        fetchData(`https://docs.google.com/spreadsheets/d/1JPptsNfP9Qw0ndxXq8DVd8LW6mCQm_aiO98iVNvs53M/gviz/tq?tqx=out:csv&sheet=Sheet1&tq=SELECT * WHERE B = '${suggestion}'`);
                        suggestionsList.style.display = 'none';
                    });
                    suggestionsList.appendChild(li);
                });

                suggestionsList.style.display = filteredSuggestions.length > 0 ? 'block' : 'none';
            }

            function fetchData(url) {
                fetch(url)
                    .then(response => response.text())
                    .then(data => {
                        const rows = data.split('\n').map(row => row.split(','));
                        totalItems = rows.length;
                        processItems(rows);
                    })
                    .catch(error => console.error('Error fetching data:', error));
            }

            function processItems(items) {
                const mediaContainer = document.querySelector('#mediaContainer');
                const newItems = items.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage);

                displayedItems = displayedItems.concat(newItems);

                if (displayedItems.length === 0) {
                    mediaContainer.innerHTML = '<p>No items to display.</p>';
                } else {
                    displayItems(displayedItems);
                }

                if (displayedItems.length < totalItems) {
                    currentPage++;
                }
            }

            function displayItems(items) {
                const mediaContainer = document.querySelector('#mediaContainer');
                mediaContainer.innerHTML = '';

                items.forEach(item => {
                    const [id, name, price, urls, description, type, category] = item.map(value => value.replace(/(^"|"$)/g, ''));
                    const mediaItem = document.createElement('div');
                    mediaItem.classList.add('media-item');
                    mediaItem.classList.add(category.trim().toLowerCase());
                    mediaContainer.appendChild(mediaItem);

                    if (type.trim().toLowerCase() === 'img') {
                        const urlsArray = urls.split('+');
                        const vrMediaGallery = document.createElement('div');
                        vrMediaGallery.classList.add('vrmedia-gallery');

                        const ulEcommerceGallery = document.createElement('ul');
                        ulEcommerceGallery.classList.add('ecommerce-gallery');
                        ulEcommerceGallery.style.listStyle = 'none';
                        urlsArray.forEach(url => {
                            const li = document.createElement('li');
                            li.dataset.fancybox = 'gallery';
                            li.dataset.src = url.trim();
                            li.dataset.thumb = url.trim();
                            li.innerHTML = `<img src="${url.trim()}" alt="${name}">`;
                            ulEcommerceGallery.appendChild(li);
                        });

                        vrMediaGallery.appendChild(ulEcommerceGallery);
                        mediaItem.appendChild(vrMediaGallery);

                        const details = document.createElement('div');
                        details.classList.add('details');
                        details.innerHTML = `
                            <p class="name"><strong>${name}</strong></p>
                            <p>Description:<br>${description}</p>
                            <p>Price: ${price}</p>
                            <button class="buy-btn" onclick="showId('${id}')">Buy Now</button>
                        `;
                        mediaItem.appendChild(details);
                    } else if (type.trim().toLowerCase() === 'video') {
                        const video = document.createElement('video');
                        video.src = urls;
                        video.controls = true;
                        video.loop = true;

                        videos.push(video);
                        const details = document.createElement('div');
                        details.classList.add('details');
                        details.innerHTML = `
                            <p class="name"><strong>${name}</strong></p>
                            <p>Description: ${description}</p>
                            <p>Price: ${price}</p>
                            <button class="buy-btn" onclick="showId('${id}')">Buy Now</button>
                        `;
                        mediaItem.appendChild(video);
                        mediaItem.appendChild(details);

                        video.addEventListener('play', function () {
                            videos.forEach(vid => {
                                if (vid !== video) {
                                    vid.pause();
                                }
                            });
                        });

                        window.addEventListener('scroll', function () {
                            const rect = mediaItem.getBoundingClientRect();
                            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                                video.play();
                            } else {
                                video.pause();
                            }
                        });
                    }
                });
            }

            // Function to show item ID (to be implemented as needed)
            function showId(id) {
                alert(`Showing details for ID: ${id}`);
            }
        });