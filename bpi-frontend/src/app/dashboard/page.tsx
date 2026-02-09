'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CreditCard,
  DollarSign,
  Download,
  TrendingUp,
  UserPlus,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import { SendMoneyModal } from '@/components/ui/SendMoneyModal'
import { RequestMoneyModal } from '@/components/ui/RequestMoneyModal'

interface Transaction {
  id: string
  createdAt: string
  fromHandle: string
  toHandle: string
  amount: number
  status: string
  direction: string
  type?: string
  expiresAt?: string
}

interface User {
  id: string
  bpiHandle: string
  [key: string]: unknown
}

export default function DashboardPage() {
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false)
  const [showRequestMoneyModal, setShowRequestMoneyModal] = useState(false)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceResponse, transactionsResponse, userResponse] = await Promise.all([
          apiClient.getBalance(),
          apiClient.getTransactions({ limit: 10 }),
          apiClient.getMe()
        ])
        setBalance(balanceResponse.data.balance)
        setTransactions(transactionsResponse.data.transactions)
        setUser(userResponse.data.user)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSendMoney = async (amount: number, recipient: string) => {
    try {
      await apiClient.sendPayment({
        recipientHandle: recipient,
        amount: amount,
        memo: 'Payment via dashboard'
      })

      const [balanceResponse, transactionsResponse] = await Promise.all([
        apiClient.getBalance(),
        apiClient.getTransactions({ limit: 10 })
      ])
      setBalance(balanceResponse.data.balance)
      setTransactions(transactionsResponse.data.transactions)

      alert('Payment sent successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      alert('Failed to send payment: ' + message)
    }
  }

  const handleFulfillRequest = async (requestId: string) => {
    try {
      await apiClient.fulfillRequest(requestId)

      const [balanceResponse, transactionsResponse] = await Promise.all([
        apiClient.getBalance(),
        apiClient.getTransactions({ limit: 10 })
      ])
      setBalance(balanceResponse.data.balance)
      setTransactions(transactionsResponse.data.transactions)

      alert('Payment request fulfilled successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      alert('Failed to fulfill payment request: ' + message)
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await apiClient.declineRequest(requestId)

      const transactionsResponse = await apiClient.getTransactions({ limit: 10 })
      setTransactions(transactionsResponse.data.transactions)

      alert('Payment request declined successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      alert('Failed to decline payment request: ' + message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s your financial overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRequestMoneyModal(true)}
            className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Request Money
          </Button>
          <Button
            onClick={() => setShowSendMoneyModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Send Money
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Payments</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Pending requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-300">Date</TableHead>
                  <TableHead className="text-slate-300">Description</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-right text-slate-300">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? transactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                    <TableCell className="text-slate-300">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {txn.direction === 'sent' ? `To ${txn.toHandle}` : `From ${txn.fromHandle}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            txn.status === 'completed' ? 'default' :
                            txn.status === 'pending' ? 'secondary' :
                            txn.status === 'declined' ? 'destructive' : 'outline'
                          }
                          className={`text-xs ${
                            txn.status === 'completed' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                            txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' :
                            txn.status === 'declined' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                            'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                        >
                          {txn.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {txn.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {txn.status === 'declined' && <XCircle className="w-3 h-3 mr-1" />}
                          {txn.status}
                        </Badge>
                        {txn.type === 'request' && user && txn.fromHandle === user.bpiHandle && txn.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                              onClick={() => handleFulfillRequest(txn.id)}
                            >
                              Pay
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                              onClick={() => handleDeclineRequest(txn.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        txn.direction === 'received' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {txn.direction === 'received' ? '+' : '-'}
                      ₹{Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="w-8 h-8 text-slate-500" />
                        <p>No transactions yet</p>
                        <p className="text-sm">Your payment history will appear here</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Send Money Modal */}
      <SendMoneyModal
        isOpen={showSendMoneyModal}
        onClose={() => setShowSendMoneyModal(false)}
        userBalance={balance}
        onSend={handleSendMoney}
      />

      <RequestMoneyModal
        isOpen={showRequestMoneyModal}
        onClose={() => setShowRequestMoneyModal(false)}
      />
    </motion.div>
  )
}
