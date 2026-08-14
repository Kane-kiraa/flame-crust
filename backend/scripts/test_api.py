#!/usr/bin/env python3
"""តេស្ត endpoints សំខាន់ៗរបស់ Flame & Crust API។"""

import argparse
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def get_json(base_url: str, path: str):
    url = f"{base_url.rstrip('/')}{path}"
    request = Request(url, headers={"Accept": "application/json"})
    try:
        with urlopen(request, timeout=5) as response:
            if response.status != 200:
                raise AssertionError(f"{path}: expected HTTP 200, got {response.status}")
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise AssertionError(f"{path}: HTTP {error.code}") from error
    except URLError as error:
        raise AssertionError(f"{path}: cannot connect ({error.reason})") from error


def check_api(base_url: str) -> None:
    health = get_json(base_url, "/api/health")
    assert health.get("status") == "ok", f"health response is invalid: {health}"
    print("PASS /api/health")

    products = get_json(base_url, "/api/products")
    assert isinstance(products, list), "/api/products must return a JSON array"
    assert products, "/api/products returned no products"
    for product in products:
        for field in ("id", "name", "price", "category", "active"):
            assert field in product, f"product is missing '{field}': {product}"
        assert product["active"] is True, f"inactive product returned: {product['id']}"
    print(f"PASS /api/products ({len(products)} products)")

    pizza = get_json(base_url, "/api/products/pizza")
    assert isinstance(pizza, list), "/api/products/pizza must return a JSON array"
    assert pizza, "/api/products/pizza returned no products"
    assert all(item["category"].lower() == "pizza" for item in pizza)
    print(f"PASS /api/products/pizza ({len(pizza)} products)")

    dashboard = get_json(base_url, "/api/dashboard")
    dashboard_fields = ("products", "customers", "addresses", "orders", "orderItems", "payments")
    assert isinstance(dashboard, dict), "/api/dashboard must return a JSON object"
    for field in dashboard_fields:
        assert field in dashboard, f"dashboard is missing '{field}'"
        assert isinstance(dashboard[field], list), f"dashboard.{field} must be an array"
    assert len(dashboard["products"]) == len(products), "dashboard product count does not match products API"
    print("PASS /api/dashboard (all dashboard sections)")

    resources = (
        "roles", "users", "customers", "addresses", "categories", "products",
        "product_options", "product_variants", "reviews", "carts", "cart_items",
        "coupons", "orders", "order_items", "payments", "drivers", "otps", "audit_logs",
    )
    for resource in resources:
        rows = get_json(base_url, f"/api/admin/{resource}")
        assert isinstance(rows, list), f"/api/admin/{resource} must return a JSON array"
        print(f"PASS /api/admin/{resource} ({len(rows)} rows)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Test Flame & Crust REST API")
    parser.add_argument("--base-url", default="http://localhost:8080")
    args = parser.parse_args()

    try:
        check_api(args.base_url)
    except (AssertionError, json.JSONDecodeError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    print("All API tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
