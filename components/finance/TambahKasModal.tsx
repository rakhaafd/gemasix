import React, { useState, useEffect } from "react";
import { addFinanceTransaction, updateFinanceTransaction, FinanceTransaction } from "@/lib/finance";
import { Button, ModalWrapper, FormLabel, FormInput, FormTextarea } from "@/components/ui";
import { showSuccess, showError } from "@/lib/swal";

interface TambahKasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: FinanceTransaction | null;
}

export default function TambahKasModal({ isOpen, onClose, initialData }: TambahKasModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setAmount(initialData.amount.toString());
    } else if (!isOpen) {
      setAmount("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsLoading(true);
    try {
      if (initialData?.id) {
        await updateFinanceTransaction(initialData.id, {
          amount: Number(amount),
        });
      } else {
        await addFinanceTransaction({
          type: "base_cash",
          title: "Penambahan Uang Kas Pokok",
          amount: Number(amount),
        });
      }
      setAmount("");
      showSuccess("Berhasil!", initialData?.id ? "Uang kas berhasil diperbarui." : "Uang kas baru berhasil ditambahkan.");
      onClose();
    } catch (error) {
      console.error("Failed to save base cash", error);
      showError("Gagal!", "Gagal menyimpan kas. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Uang Kas" : "Tambah Uang Kas"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FormLabel htmlFor="amount" required>Nominal (Rp)</FormLabel>
          <FormInput
            id="amount"
            type="number"
            required
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 1000000"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            as="button"
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="!text-neutral-500 hover:!text-primary-900"
          >
            Batal
          </Button>
          <Button
            as="button"
            type="submit"
            variant="primary"
            disabled={isLoading || !amount}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
