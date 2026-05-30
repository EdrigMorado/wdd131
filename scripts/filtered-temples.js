const temples = [
    {
        templeName: "Aba Nigeria",
        location: "Aba, Nigeria",
        dedicated: "2005, August, 7",
        area: 11500,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
    },
    {
        templeName: "Manti Utah",
        location: "Manti, Utah, United States",
        dedicated: "1888, May, 21",
        area: 74792,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
    },
    {
        templeName: "Payson Utah",
        location: "Payson, Utah, United States",
        dedicated: "2015, June, 7",
        area: 96630,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
    },
    {
        templeName: "Yigo Guam",
        location: "Yigo, Guam",
        dedicated: "2020, May, 2",
        area: 6861,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
    },
    {
        templeName: "Washington D.C.",
        location: "Kensington, Maryland, United States",
        dedicated: "1974, November, 19",
        area: 156558,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
    },
    {
        templeName: "Lima Perú",
        location: "Lima, Perú",
        dedicated: "1986, January, 10",
        area: 9600,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
    },
    {
        templeName: "Mexico City Mexico",
        location: "Mexico City, Mexico",
        dedicated: "1983, December, 2",
        area: 116642,
        imageUrl:
            "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
    },
    {
        templeName: "San Diego California",
        location: "San Diego, California, United States",
        dedicated: "1993, April, 25",
        area: 72000,
        imageUrl:
            "https://www.churchofjesuschrist.org/imgs/4a0d917c90492f259a7a1124c1feaca9739c1853/full/400%2C/0/default"
    },
    {
        templeName: "Rome Italy",
        location: "Rome, Italy",
        dedicated: "2019, March, 10",
        area: 41010,
        imageUrl:
            "https://www.churchofjesuschrist.org/imgs/882909eb6a835276e4dd9519b93cad9da6e223a3/full/400%2C/0/default"
    },
    {
        templeName: "Tokyo Japan",
        location: "Tokyo, Japan",
        dedicated: "1980, October, 27",
        area: 52590,
        imageUrl:
            "https://www.churchofjesuschrist.org/imgs/f36ff27e1c9f11ecac0eeeeeac1e10ba7fe5b940/full/400%2C/0/default"
    }
];

const currentYear = document.querySelector("#currentyear");
const lastModified = document.querySelector("#lastModified");
const menuButton = document.querySelector("#menu");
const navigation = document.querySelector("#navigation");
const templeCards = document.querySelector("#temple-cards");
const pageTitle = document.querySelector("#page-title");

currentYear.textContent = new Date().getFullYear();
lastModified.textContent = `Last Modification: ${document.lastModified}`;

function getDedicatedYear(temple) {
    return Number(temple.dedicated.split(",")[0]);
}

function displayTemples(templeList) {
    templeCards.innerHTML = "";

    templeList.forEach((temple) => {
        const card = document.createElement("article");
        const name = document.createElement("h2");
        const location = document.createElement("p");
        const dedicated = document.createElement("p");
        const area = document.createElement("p");
        const image = document.createElement("img");

        card.classList.add("temple-card");

        name.textContent = temple.templeName;
        location.innerHTML = `<strong>Location:</strong> ${temple.location}`;
        dedicated.innerHTML = `<strong>Dedicated:</strong> ${temple.dedicated}`;
        area.innerHTML = `<strong>Size:</strong> ${temple.area.toLocaleString()} sq ft`;

        image.src = temple.imageUrl;
        image.alt = `${temple.templeName} Temple`;
        image.loading = "lazy";
        image.width = 400;
        image.height = 250;

        card.appendChild(name);
        card.appendChild(location);
        card.appendChild(dedicated);
        card.appendChild(area);
        card.appendChild(image);

        templeCards.appendChild(card);
    });
}

function getFilteredTemples(filter) {
    switch (filter) {
        case "old":
            return temples.filter((temple) => getDedicatedYear(temple) < 1900);
        case "new":
            return temples.filter((temple) => getDedicatedYear(temple) > 2000);
        case "large":
            return temples.filter((temple) => temple.area > 90000);
        case "small":
            return temples.filter((temple) => temple.area < 10000);
        default:
            return temples;
    }
}

function updateActiveLink(selectedLink) {
    const navLinks = navigation.querySelectorAll("a");

    navLinks.forEach((link) => {
        link.classList.remove("active");
    });

    selectedLink.classList.add("active");
}

navigation.addEventListener("click", (event) => {
    const selectedLink = event.target.closest("a[data-filter]");

    if (!selectedLink) {
        return;
    }

    event.preventDefault();

    const filter = selectedLink.dataset.filter;
    const filteredTemples = getFilteredTemples(filter);

    pageTitle.textContent = selectedLink.textContent;
    displayTemples(filteredTemples);
    updateActiveLink(selectedLink);

    menuButton.classList.remove("open");
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-label", "Open navigation menu");
});

menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("open");
    navigation.classList.toggle("open");

    if (navigation.classList.contains("open")) {
        menuButton.setAttribute("aria-label", "Close navigation menu");
    } else {
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }
});

displayTemples(temples);
