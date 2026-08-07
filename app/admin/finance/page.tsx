"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader, Card, Button, PageContainer, EmptyState, IconButton, TableSkeleton, Pagination } from "@/components/ui";
import { Wallet, TrendingUp, TrendingDown, Plus, CreditCard, Receipt, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import TambahKasModal from "@/components/finance/TambahKasModal";
import TambahPemasukanModal from "@/components/finance/TambahPemasukanModal";
import TambahPengeluaranModal from "@/components/finance/TambahPengeluaranModal";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { FinanceTransaction, deleteFinanceTransaction } from "@/lib/finance";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  // Modal states
  const [isKasModalOpen, setIsKasModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // Edit state
  const [transactionToEdit, setTransactionToEdit] = useState<FinanceTransaction | null>(null);

  useEffect(() => {
    const q = query(
      collection(clientDb, "finance_transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format timestamp to date if it exists
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })) as FinanceTransaction[];
      setTransactions(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalBaseCash = transactions
    .filter(t => t.type === "base_cash")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalBaseCash + totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date | Timestamp) => {
    const dateObj = date instanceof Date ? date : new Date(date as any);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(dateObj);
  };

  const handleEdit = (tx: FinanceTransaction) => {
    setTransactionToEdit(tx);
    if (tx.type === "base_cash") setIsKasModalOpen(true);
    else if (tx.type === "income") setIsIncomeModalOpen(true);
    else if (tx.type === "expense") setIsExpenseModalOpen(true);
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Catatan Keuangan?",
      text: "Apakah Anda yakin ingin menghapus catatan keuangan ini? Aksi ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteFinanceTransaction(id, imageUrl);
        showSuccess("Berhasil!", "Catatan keuangan telah berhasil dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus catatan keuangan.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsKasModalOpen(false);
    setIsIncomeModalOpen(false);
    setIsExpenseModalOpen(false);
    // Delay clearing the state slightly so the modal exit animation doesn't flash empty data
    setTimeout(() => setTransactionToEdit(null), 300);
  };

  return (
    <div>
      <AdminPageHeader 
        title="Catatan Keuangan" 
        description="Transparansi pemasukan dan pengeluaran kas Karang Taruna." 
      />
      
      <PageContainer>
        <div className="flex flex-col gap-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-primary-800 border-2 border-primary-700 shadow-[4px_4px_0_var(--color-primary-900)] hover:shadow-[6px_6px_0_var(--color-primary-900)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col gap-2">
              <div className="flex items-center gap-3 text-primary-300 mb-2">
                <Wallet size={20} />
                <span className="font-semibold text-sm">Total Kas Saat Ini</span>
              </div>
              <span className="text-3xl font-bold font-display text-white">
                {formatCurrency(currentBalance)}
              </span>
            </Card>

            <Card className="p-6 bg-primary-800 border-2 border-primary-700 shadow-[4px_4px_0_var(--color-primary-900)] hover:shadow-[6px_6px_0_var(--color-primary-900)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col gap-2">
              <div className="flex items-center gap-3 text-accent-green-500 mb-2">
                <TrendingUp size={20} />
                <span className="font-semibold text-sm">Total Pemasukan</span>
              </div>
              <span className="text-3xl font-bold font-display text-white">
                {formatCurrency(totalIncome)}
              </span>
            </Card>

            <Card className="p-6 bg-primary-800 border-2 border-primary-700 shadow-[4px_4px_0_var(--color-primary-900)] hover:shadow-[6px_6px_0_var(--color-primary-900)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col gap-2">
              <div className="flex items-center gap-3 text-accent-red-500 mb-2">
                <TrendingDown size={20} />
                <span className="font-semibold text-sm">Total Pengeluaran</span>
              </div>
              <span className="text-3xl font-bold font-display text-white">
                {formatCurrency(totalExpense)}
              </span>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              as="button"
              variant="secondary"
              size="sm"
              icon={CreditCard}
              iconPosition="left"
              onClick={() => { setTransactionToEdit(null); setIsKasModalOpen(true); }}
            >
              Tambah Kas
            </Button>
            <Button 
              as="button"
              variant="primary"
              size="sm"
              icon={TrendingUp}
              iconPosition="left"
              onClick={() => { setTransactionToEdit(null); setIsIncomeModalOpen(true); }}
            >
              Tambah Pemasukan
            </Button>
            <Button 
              as="button"
              variant="danger"
              size="sm"
              icon={TrendingDown}
              iconPosition="left"
              onClick={() => { setTransactionToEdit(null); setIsExpenseModalOpen(true); }}
            >
              Tambah Pengeluaran
            </Button>
          </div>

          {/* Transactions List */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h2 className="font-bold text-primary-900 font-display">Riwayat Transaksi</h2>
            </div>
        
        {isLoading ? (
          <TableSkeleton />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada transaksi"
            description="Mulai kelola kas organisasi secara transparan. Catat setiap pemasukan dan pengeluaran."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-4 font-semibold w-40">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Transaksi</th>
                    <th className="px-6 py-4 font-semibold text-right">Nominal</th>
                    <th className="px-6 py-4 font-semibold text-center w-24">Bukti</th>
                    <th className="px-6 py-4 font-semibold text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {transactions
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-neutral-500 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-neutral-900">{tx.title}</span>
                          {tx.description && (
                            <span className="text-xs text-neutral-500 truncate max-w-xs">
                              {tx.description}
                            </span>
                          )}
                          <span className="inline-flex mt-1">
                            {tx.type === "income" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green-50 text-accent-green-600 border border-accent-green-200 font-medium">Pemasukan</span>
                            ) : tx.type === "expense" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-red-50 text-accent-red-600 border border-accent-red-200 font-medium">Pengeluaran</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-200 font-medium">Uang Kas</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                        <span className={`font-semibold ${
                          tx.type === "expense" ? "text-accent-red-600" : "text-accent-green-600"
                        }`}>
                          {tx.type === "expense" ? "-" : "+"}{formatCurrency(tx.amount)}
                        </span>
                        {tx.quantity && (
                          <div className="text-xs text-neutral-400 mt-1">
                            {tx.quantity} item
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tx.imageUrl ? (
                          <a 
                            href={tx.imageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Lihat Bukti"
                          >
                            <ImageIcon size={18} />
                          </a>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                          <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(tx)} label="Edit" className="mr-1" />
                          <IconButton icon={Trash2} variant="danger" onClick={() => tx.id && handleDelete(tx.id, tx.imageUrl)} label="Hapus" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile List View */}
            <div className="md:hidden flex flex-col divide-y divide-neutral-100">
              {transactions
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((tx) => (
                <div key={tx.id} className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-bold text-primary-900 leading-tight">{tx.title}</span>
                      <span className="text-xs text-neutral-500">{formatDate(tx.createdAt)}</span>
                      <span className="inline-flex mt-1">
                        {tx.type === "income" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green-50 text-accent-green-600 border border-accent-green-200 font-bold">Pemasukan</span>
                        ) : tx.type === "expense" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-red-50 text-accent-red-600 border border-accent-red-200 font-bold">Pengeluaran</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-200 font-bold">Uang Kas</span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className={`font-bold whitespace-nowrap ${
                        tx.type === "expense" ? "text-accent-red-600" : "text-accent-green-600"
                      }`}>
                        {tx.type === "expense" ? "-" : "+"}{formatCurrency(tx.amount)}
                      </span>
                      {tx.quantity && (
                        <span className="text-xs font-semibold text-neutral-400 mt-0.5">
                          {tx.quantity} item
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {tx.description && (
                    <p className="text-sm text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                      {tx.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-neutral-100">
                    <div>
                      {tx.imageUrl ? (
                        <a 
                          href={tx.imageUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ImageIcon size={14} /> Bukti Foto
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-neutral-400 px-1">Tidak ada foto</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(tx)} label="Edit" />
                      <IconButton icon={Trash2} variant="danger" onClick={() => tx.id && handleDelete(tx.id, tx.imageUrl)} label="Hapus" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(transactions.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalItems={transactions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              className="p-4 border-t border-neutral-100 bg-neutral-50/30"
            />
          </>
            )}
          </div>
        </div>
      </PageContainer>

      <TambahKasModal 
        isOpen={isKasModalOpen} 
        onClose={handleCloseModal} 
        initialData={transactionToEdit}
      />
      <TambahPemasukanModal 
        isOpen={isIncomeModalOpen} 
        onClose={handleCloseModal} 
        initialData={transactionToEdit}
      />
      <TambahPengeluaranModal 
        isOpen={isExpenseModalOpen} 
        onClose={handleCloseModal} 
        initialData={transactionToEdit}
      />
    </div>
  );
}
