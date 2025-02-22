const express = require("express");
const axios = require("axios");

const router = express.Router();

const githubAPI = "https://api.github.com";

const authCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

router.get("/repos", authCheck, async (req, res) => {
  try {
    const { accessToken } = req.user;
    const response = await axios.get(`${githubAPI}/user/repos`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/branches/:owner/:repo", authCheck, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { accessToken } = req.user;
    const response = await axios.get(
      `${githubAPI}/repos/${owner}/${repo}/branches`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/repo/:owner/:repo", authCheck, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { accessToken } = req.user;

    const headers = { Authorization: `Bearer ${accessToken}` };

    const repoDetailsUrl = `${githubAPI}/repos/${owner}/${repo}`;
    const branchesUrl = `${githubAPI}/repos/${owner}/${repo}/branches`;
    const commitsUrl = `${githubAPI}/repos/${owner}/${repo}/commits`;

    const [repoDetailsResponse, branchesResponse, commitsResponse] =
      await Promise.all([
        axios.get(repoDetailsUrl, { headers }),
        axios.get(branchesUrl, { headers }),
        axios.get(commitsUrl, { headers }),
      ]);

    const data = {
      repository: repoDetailsResponse.data,
      branches: branchesResponse.data,
      commits: commitsResponse.data,
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
