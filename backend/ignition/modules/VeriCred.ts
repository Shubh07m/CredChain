
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * @title VeriCredModule
 * @notice This module deploys the VeriCred contract.
 */
const VeriCredModule = buildModule("VeriCredModule", (m) => {
  // Your constructor() is empty, so the args array is empty [cite: 27]
  const args: any[] = [];

  // Get the VeriCred contract [cite: 4]
  const veriCred = m.contract("VeriCred", args);

  // Return the deployed contract instance
  return { veriCred };
});

export default VeriCredModule;