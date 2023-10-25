# action-setup-google-java-format

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)

This action downloads google-java-format on your runner
so that it can be used easily on your jobs.

It is also meant to be used with
[action-google-java-format](https://github.com/thecanadianroot/action-google-java-format)
which suggests changes within your pull requests.

## Usage

```yaml
steps:
  - name: Setup google-java-format
    id: setup-google-java-format
    uses: thecanadianroot/action-setup-google-java-format@v1
    with:
      token: ${{ github.token }} # optional
      install-path: ${{ github.workspace }} # optional
      version: latest # optional
      ignore-cached-install: false # optional
```

Outputs

| Output    | Description                                                |
|-----------|------------------------------------------------------------|
| `path`    | The install path of google-java-format (the jar location). |
| `version` | The installed version of google-java-format.               |
