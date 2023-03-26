import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'

/**
 * Returns the native token balance of the given `address`.
 */
export const getBalance = async (
  api: ApiPromise,
  address: string | AccountId,
  fractionDigits = 2,
): Promise<{
  freeBalance: BN
  reservedBalance: BN
  balance: BN
  balanceFormatted: string
  tokenSymbol: string
  tokenDecimals: number
}> => {
  // Get the token decimals and symbol
  const tokenDecimals = api.registry.chainDecimals?.[0] || 12
  const tokenSymbol = api.registry.chainTokens?.[0] || 'Unit'

  // Get the balance
  const result: any = await api.query.system.account(address)
  const freeBalance: BN = new BN(result?.data?.free || 0)
  const reservedBalance: BN = new BN(result?.data?.reserved || 0)
  const balance = reservedBalance.add(freeBalance)

  // Format the balance
  const balanceNormalized =
    balance
      ?.div?.(new BN(10).pow(new BN(tokenDecimals - fractionDigits + 1)))
      .toNumber() /
    10 ** (fractionDigits + 1)
  const balanceFormatted = balanceNormalized.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

  return {
    freeBalance,
    reservedBalance,
    balance,
    balanceFormatted,
    tokenSymbol,
    tokenDecimals,
  }
}
