// Step 1: Initialize
const axios = require('axios');
const cheerio = require('cheerio');

class ProductHunter {
  /**
   * Initialize the product research engine
   */
  constructor() {
    this.apiKey = process.env.PRODUCT_HUNTER_API_KEY;
    this.baseURL = 'https://api.product-hunter.com/v1';
    this.searchResults = [];
    this.trendingProducts = [];
  }

  // Step 2: Process
  async searchProducts(query, category = 'all') {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          query,
          category,
          apiKey: this.apiKey,
          limit: 50
        }
      });

      this.searchResults = response.data.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        rating: product.rating,
        reviews: product.reviews,
        image: product.image,
        url: product.url,
        supplier: product.supplier,
        shippingTime: product.shipping_time,
        profitMargin: this.calculateProfitMargin(product.price)
      }));

      return this.searchResults;
    } catch (error) {
      console.error('Error searching products:', error.message);
      throw new Error('Failed to search products');
    }
  }

  async getTrendingProducts(category = 'all') {
    try {
      const response = await axios.get(`${this.baseURL}/trending`, {
        params: {
          category,
          apiKey: this.apiKey,
          limit: 20
        }
      });

      this.trendingProducts = response.data.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        trendScore: product.trend_score,
        searchVolume: product.search_volume,
        competition: product.competition,
        potentialProfit: this.calculatePotentialProfit(product.price, product.trend_score)
      }));

      return this.trendingProducts;
    } catch (error) {
      console.error('Error fetching trending products:', error.message);
      throw new Error('Failed to fetch trending products');
    }
  }

  // Step 3: Complete
  calculateProfitMargin(price) {
    // Simulated profit margin calculation
    const baseCost = price * 0.6; // Assuming 40% profit margin
    const shippingCost = price * 0.1; // Assuming 10% shipping cost
    return {
      baseCost,
      shippingCost,
      netProfit: price - baseCost - shippingCost,
      marginPercentage: ((price - baseCost - shippingCost) / price) * 100
    };
  }

  calculatePotentialProfit(price, trendScore) {
    // Simulated potential profit calculation based on trend score
    const baseProfit = price * 0.3; // Base profit assumption
    const trendMultiplier = trendScore / 100;
    return baseProfit * trendMultiplier;
  }

  async scrapeCompetitorPrices(productUrl) {
    try {
      const response = await axios.get(productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const competitorPrice = parseFloat($('.price').text().replace(/[^0-9.]/g, ''));

      return {
        competitorPrice,
        ourPrice: this.searchResults.find(p => p.url === productUrl)?.price,
        priceDifference: competitorPrice - this.searchResults.find(p => p.url === productUrl)?.price
      };
    } catch (error) {
      console.error('Error scraping competitor prices:', error.message);
      return null;
    }
  }
}

module.exports = ProductHunter;
