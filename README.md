# Price Deviation Calculator

This project calculates the price deviation between Oracle and DEX (Decentralized Exchange) data for various cryptocurrency trading pairs (BTC/USDT, ETH/USDT, PEPE/USDT, DOGE/USDT). The deviation is calculated as the maximum relative difference between Oracle and DEX prices over a specified time period.

## Project Overview

The project consists of scripts to:
- Aggregate hourly DEX price data.
- Compare Oracle and DEX prices to calculate the maximum deviation.
- Save the results in the `deviation` directory as JSON files.

The data used in this project spans from `2025-04-05 18:00:00` to `2025-04-07 18:00:00` and includes the following trading pairs:
- BTC/USDT
- ETH/USDT
- PEPE/USDT
- DOGE/USDT

## Prerequisites

To run this project, you need to have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher recommended)
- [Git](https://git-scm.com/) (to clone the repository)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lizaveta-yemets/price-deviation.git
   cd price-deviation
