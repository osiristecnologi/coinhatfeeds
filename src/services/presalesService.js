/ src/services/presalesService.js

const presales = [
  {
    id: "1",
    name: "Demo Presale",
    symbol: "DPR",
    price: 0.0001,
    status: "active",
    liquidity: "low",
    marketCap: 120000
  },
  {
    id: "2",
    name: "Alpha Token",
    symbol: "ALP",
    price: 0.002,
    status: "upcoming",
    liquidity: "medium",
    marketCap: 800000
  }
];

// GET ALL
function getPresales(status = null) {
  if (!status) return presales;
  return presales.filter(p => p.status === status);
}

// GET BY ID
function getPresaleById(id) {
  return presales.find(p => p.id === id);
}

module.exports = {
  getPresales,
  getPresaleById
};
