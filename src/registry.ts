import { SubstrateDeployment } from '@/types/'
import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import { Dispatch, SetStateAction } from 'react'

/**
 * Registering the given `deployment` with the given `setDeployments` dispatcher.
 * The registry is kept unique, so if there is already one deployment with
 * equal `contractId` and `networkId` it will be replaced.
 */
export const registerDeployment = (
  setDeployments: Dispatch<SetStateAction<SubstrateDeployment[]>>,
  deployment: SubstrateDeployment,
) => {
  setDeployments((deployments) => {
    // Check if deployment already exists & remove
    const idx = deployments.findIndex(
      ({ contractId, networkId }) =>
        contractId.toLowerCase() === deployment.contractId.toLowerCase() &&
        networkId.toLowerCase() === deployment.networkId.toLowerCase(),
    )
    if (idx >= 0) deployments.splice(idx, 1)

    // Add new deployment
    return [...deployments, deployment]
  })
}

/**
 * Registers all given `deployments` via `registerDeployment` after awaiting the promise.
 */
export const registerDeployments = async (
  setDeployments: Dispatch<SetStateAction<SubstrateDeployment[]>>,
  deployments: Promise<SubstrateDeployment[]>,
) => {
  ;(await deployments).forEach((deployment) => registerDeployment(setDeployments, deployment))
}

/**
 * Returns the first matching deployment from the given `deployments` array
 * with an equal `contractId` and `networkId`
 */
export const getDeployment = (
  deployments: SubstrateDeployment[],
  contractId: string,
  networkId: string,
) => {
  return deployments.find((deployment) => {
    return (
      deployment.contractId.toLowerCase() === contractId.toLowerCase() &&
      deployment.networkId.toLowerCase() === (networkId || '').toLowerCase()
    )
  })
}

/**
 * Takes the first matching deployment from the given `deployments` array
 * with an equal `contractId` and `networkId` and creates a `ContractPromise`.
 */
export const getDeploymentContract = (
  api: ApiPromise,
  deployments: SubstrateDeployment[],
  contractId: string,
  networkId: string,
) => {
  if (!api) return undefined
  const deployment = getDeployment(deployments || [], contractId, networkId)
  if (!deployment) return undefined
  return new ContractPromise(api, deployment?.abi, deployment?.address)
}
