"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User, ArrowRight } from 'lucide-react'

interface SendMoneyModalProps {
  isOpen: boolean
  onClose: () => void
  userBalance: number
  onSend: (amount: number, recipient: string) => void
}

export function SendMoneyModal({ isOpen, onClose, userBalance, onSend }: SendMoneyModalProps) {
  const [step, setStep] = useState(1)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickAmounts = [1000, 2500, 5000, 10000]

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d*$/
    if (regex.test(value) || value === '') {
      setAmount(value)
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    try {
      await onSend(parseInt(amount), recipient.toLowerCase())
      setIsLoading(false)
      handleClose()
    } catch (error) {
      setIsLoading(false)
      alert('Failed to send payment')
    }
  }

  const handleClose = () => {
    setStep(1)
    setRecipient('')
    setAmount('')
    setMemo('')
    setIsLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Send Money</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 1 && (
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Recipient BPI ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="username@alpha or username@beta"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!recipient}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">Sending to</p>
                  <p className="font-semibold">{recipient}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-2xl font-semibold text-center"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-400 mt-2">Available: ₹{userBalance.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      ₹{quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Memo (Optional)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="What's this for?"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!amount || parseInt(amount) > userBalance || isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send ₹{amount || '0'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
