
import { useEffect, useMemo, useState } from 'react';

import {
  getExpenseReport,
  getPurchaseReport,
  getSalesReport,
  getStockReport,
} from '../../lib/api/reports';

import type { Expense } from '../../types/expense';
import type { Product } from '../../types/product';
import type { Purchase } from '../../types/purchase';
import type { Sale } from '../../types/sale';

type ReportTab = 'sales' | 'purchases' | 'expenses' | 'stock';

const reportTabs: { key: ReportTab; label: string }[] = [
  { key: 'sales', label: 'Sales' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'stock', label: 'Stock' },
];

const ITEMS_PER_PAGE = 10;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    }
  ).response;

  return response?.data?.message || fallback;
}

function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');

  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  const [totalSales, setTotalSales] = useState(0);
  const [salesTransactions, setSalesTransactions] = useState(0);
  const [totalPurchase, setTotalPurchase] = useState(0);
  const [purchaseTransactions, setPurchaseTransactions] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseTransactions, setExpenseTransactions] = useState(0);
  const [totalStockUnits, setTotalStockUnits] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadReport = async (tab: ReportTab) => {
    try {
      setLoading(true);
      setError('');

      if (tab === 'sales') {
        const response = await getSalesReport();

        setSales(response.data.sales);
        setTotalSales(Number(response.data.total_sales));
        setSalesTransactions(response.data.total_transactions);
      }

      if (tab === 'purchases') {
        const response = await getPurchaseReport();

        setPurchases(response.data.purchases);
        setTotalPurchase(Number(response.data.total_purchase));
        setPurchaseTransactions(response.data.total_transactions);
      }

      if (tab === 'expenses') {
        const response = await getExpenseReport();

        setExpenses(response.data.expenses);
        setTotalExpenses(Number(response.data.total_expenses));
        setExpenseTransactions(response.data.total_transactions);
      }

      if (tab === 'stock') {
        const response = await getStockReport();

        setProducts(response.data.products);
        setLowStockProducts(response.data.low_stock_products);
        setTotalStockUnits(Number(response.data.total_stock_units));
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load report.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(activeTab);
  }, [activeTab]);

  const totalProductValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + Number(product.stock) * Number(product.purchase_price),
      0,
    );
  }, [products]);

  const filteredSales = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const saleDate = sale.sale_date.slice(0, 10);

      const matchesSearch =
        !searchValue ||
        [sale.invoice_no, sale.customer_id]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesFrom = !dateFrom || saleDate >= dateFrom;
      const matchesTo = !dateTo || saleDate <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [sales, search, dateFrom, dateTo]);

  const filteredPurchases = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const purchaseDate = purchase.purchase_date.slice(0, 10);

      const matchesSearch =
        !searchValue ||
        [purchase.invoice_no, purchase.supplier_id]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesFrom = !dateFrom || purchaseDate >= dateFrom;
      const matchesTo = !dateTo || purchaseDate <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [purchases, search, dateFrom, dateTo]);

  const filteredExpenses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const expenseDate = expense.expense_date.slice(0, 10);

      const matchesSearch =
        !searchValue ||
        [expense.category, expense.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesFrom = !dateFrom || expenseDate >= dateFrom;
      const matchesTo = !dateTo || expenseDate <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [expenses, search, dateFrom, dateTo]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        [product.name, product.sku, product.unit]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesLowStock =
        !lowStockOnly ||
        Number(product.stock) <= Number(product.low_stock_threshold);

      return matchesSearch && matchesLowStock;
    });
  }, [products, search, lowStockOnly]);

  const totalItems =
    activeTab === 'sales'
      ? filteredSales.length
      : activeTab === 'purchases'
        ? filteredPurchases.length
        : activeTab === 'expenses'
          ? filteredExpenses.length
          : filteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSales = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSales, safeCurrentPage]);

  const paginatedPurchases = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredPurchases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPurchases, safeCurrentPage]);

  const paginatedExpenses = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredExpenses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExpenses, safeCurrentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems);

  const resetFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setLowStockOnly(false);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    resetFilters();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const handleLowStockChange = (value: boolean) => {
    setLowStockOnly(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View sales, purchase, expense and stock reports
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-w-max border-b border-gray-200">
          {reportTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`px-6 py-3.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-500">Loading report...</p>
        </div>
      ) : (
        <>
          {(activeTab === 'sales' ||
            activeTab === 'purchases' ||
            activeTab === 'expenses') && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="report-search"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Search
                  </label>

                  <input
                    id="report-search"
                    type="text"
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder={
                      activeTab === 'sales'
                        ? 'Search invoice or customer...'
                        : activeTab === 'purchases'
                          ? 'Search invoice or supplier...'
                          : 'Search category or description...'
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-date-from"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    From Date
                  </label>

                  <input
                    id="report-date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(event) => handleDateFromChange(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-date-to"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    To Date
                  </label>

                  <input
                    id="report-date-to"
                    type="date"
                    value={dateTo}
                    onChange={(event) => handleDateToChange(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {startItem} to {endItem} of {totalItems} {activeTab}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Clear Filters
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safeCurrentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-gray-600">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label
                    htmlFor="stock-search"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Search Product
                  </label>

                  <input
                    id="stock-search"
                    type="text"
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search product name, SKU or unit..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-300 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={lowStockOnly}
                      onChange={(event) =>
                        handleLowStockChange(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Low Stock Only
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {startItem} to {endItem} of {totalItems} products
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Clear Filters
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safeCurrentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-gray-600">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(totalSales)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {salesTransactions}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Invoice
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Items
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Sale Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedSales.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                          >
                            {sales.length === 0
                              ? 'No sales found.'
                              : 'No sales match the selected filters.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {sale.invoice_no}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">
                                {sale.items.length}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">
                                {formatDate(sale.sale_date)}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(Number(sale.total_amount))}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'purchases' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Purchase
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(totalPurchase)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {purchaseTransactions}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Invoice
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Items
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Purchase Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedPurchases.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                          >
                            {purchases.length === 0
                              ? 'No purchases found.'
                              : 'No purchases match the selected filters.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedPurchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {purchase.invoice_no}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">
                                {purchase.items.length}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">
                                {formatDate(purchase.purchase_date)}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(Number(purchase.total_amount))}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'expenses' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Expenses
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {expenseTransactions}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Expense Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedExpenses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                          >
                            {expenses.length === 0
                              ? 'No expenses found.'
                              : 'No expenses match the selected filters.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedExpenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {expense.category}
                              </p>
                            </td>

                            <td className="max-w-md px-6 py-4">
                              <p className="truncate text-sm text-gray-600">
                                {expense.description || '—'}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">
                                {formatDate(expense.expense_date)}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(Number(expense.amount))}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'stock' && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Products
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Stock Units
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {totalStockUnits}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Stock Value
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(totalProductValue)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Low Stock Products
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Products at or below their low-stock threshold
                      </p>
                    </div>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {lowStockProducts.length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          SKU
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Stock
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Threshold
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Unit
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {lowStockProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                          >
                            No low stock products.
                          </td>
                        </tr>
                      ) : (
                        lowStockProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {product.name}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">
                                {product.sku}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-semibold text-red-600">
                                {product.stock}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-700">
                                {product.low_stock_threshold}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-700">
                                {product.unit}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    All Products Stock
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          SKU
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Stock
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Threshold
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Purchase Price
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Stock Value
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                          >
                            {products.length === 0
                              ? 'No products found.'
                              : 'No products match the selected filters.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {product.name}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">
                                {product.sku}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {product.stock} {product.unit}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-700">
                                {product.low_stock_threshold}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-700">
                                {formatCurrency(Number(product.purchase_price))}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  Number(product.stock) *
                                    Number(product.purchase_price),
                                )}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ReportsPage;

