from __future__ import annotations

import argparse

from .legacy_fairino_bridge import LegacyFairinoBridge


class QuickGripperClient:
    def __init__(self, bridge: LegacyFairinoBridge) -> None:
        self.bridge = bridge

    def open(self, arm: str):
        return self.bridge.open_gripper(arm)

    def close(self, arm: str):
        return self.bridge.close_gripper(arm)

    def hold_torque_for_manual_rescue(self, arm: str):
        # 不发送 disable；保持当前夹爪状态，等待人工接管。
        return self.bridge.close_gripper(arm)


def main() -> None:
    parser = argparse.ArgumentParser(description="quick gripper client")
    parser.add_argument("--arm", choices=["left", "right"], default="left")
    parser.add_argument("--open", action="store_true")
    parser.add_argument("--close", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    client = QuickGripperClient(LegacyFairinoBridge(dry_run=args.dry_run))
    if args.open:
        print(client.open(args.arm).message)
    elif args.close:
        print(client.close(args.arm).message)
    else:
        print("[OK] quick_gripper_client ready")


if __name__ == "__main__":
    main()
