const quotesService = require("../services/quotes.service");

// GET /quotes/random
async function randomHandler(req, res, next) {
  try {
    const quote = await quotesService.getRandomQuote();
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: "Belum ada data quotes di database", status: 404 },
      });
    }
    res.status(200).json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
}

// GET /quotes/by-author?name=...
async function byAuthorHandler(req, res, next) {
  try {
    const { name } = req.query;
    const quotes = await quotesService.getByAuthor(name);
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    next(err);
  }
}

// GET /quotes/by-category?category=...
async function byCategoryHandler(req, res, next) {
  try {
    const { category } = req.query;
    const quotes = await quotesService.getByCategory(category);
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    next(err);
  }
}

// GET /quotes/all?page=...&limit=...
async function allHandler(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await quotesService.getAllQuotes({ page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  randomHandler,
  byAuthorHandler,
  byCategoryHandler,
  allHandler,
};
