const statusEl = document.getElementById("status");
const tabListEl = document.getElementById("tab-list");
const saveBtn = document.getElementById("save-btn");

let linkedInTabs = [];

function setStatus(text, count, total) {
  statusEl.textContent = "";
  if (count !== undefined) {
    const span = document.createElement("span");
    span.className = "count";
    span.textContent = count;
    if (total !== undefined) {
      statusEl.append(text, span, ` / ${total}`);
    } else {
      statusEl.append("Found ", span, ` LinkedIn job tab(s)`);
    }
  } else {
    statusEl.textContent = text;
  }
}

// Find all LinkedIn job tabs
async function scanTabs() {
  const allTabs = await chrome.tabs.query({});
  linkedInTabs = allTabs.filter(
    (t) => t.url && t.url.includes("linkedin.com/jobs")
  );

  if (linkedInTabs.length === 0) {
    setStatus("No LinkedIn job tabs found.");
    return;
  }

  setStatus(null, linkedInTabs.length);
  saveBtn.disabled = false;

  tabListEl.replaceChildren();
  for (const tab of linkedInTabs) {
    const div = document.createElement("div");
    div.className = "tab-item pending";
    div.id = `tab-${tab.id}`;
    div.textContent = tab.title || tab.url;
    tabListEl.appendChild(div);
  }
}

// Extract job ID from LinkedIn URL
function getJobId(url) {
  const match = url && url.match(/\/jobs\/view\/(\d+)/);
  return match ? match[1] : null;
}

// Sanitize filename
function sanitize(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 200);
}

// Save all tabs
saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  let savedCount = 0;

  for (const tab of linkedInTabs) {
    const el = document.getElementById(`tab-${tab.id}`);
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML,
      });

      const html = results[0].result;
      const jobId = getJobId(tab.url);
      const title = sanitize(tab.title || `linkedin-job-${tab.id}`);
      const filename = jobId ? `${jobId} - ${title}` : title;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      await chrome.downloads.download({
        url: url,
        filename: `jobs/linkedin-jobs/${filename}.html`,
        saveAs: false,
      });

      el.className = "tab-item saved";
      savedCount++;
    } catch (err) {
      console.error(`Failed for tab ${tab.id}:`, err);
      el.className = "tab-item error";
      el.title = err.message;
    }

    setStatus("Saved ", savedCount, linkedInTabs.length);
  }

  setStatus("Done! Saved ", savedCount, linkedInTabs.length);
});

scanTabs();
