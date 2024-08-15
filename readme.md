<h1 align="center">
  SMB WHIP Bridge
</h1>

<div align="center">
  Provides a WHIP endpoint for Symphony Media Bridge SFU
</div>

<div align="center">
<br />

[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg?style=flat-square)](https://github.com/eyevinn/{{repo-name}}/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![made with hearth by Eyevinn](https://img.shields.io/badge/made%20with%20%E2%99%A5%20by-Eyevinn-59cbe8.svg?style=flat-square)](https://github.com/eyevinn)
[![Slack](http://slack.streamingtech.se/badge.svg)](http://slack.streamingtech.se)

</div>

This service provides a WHIP endpoint (WebRTC HTTP Ingestion Protocol) for a Symphony Media Bridge SFU. With this service you can use any WHIP compatible client push a media stream to a Sympony Media Bridge instance.

## Requirements

- NodeJs v18+
- A Symphony Media Bridge SFU instance running

## Installation / Usage

Install dependencies

```
% npm install
```

```
% export SMB_URL=<URL to Symphony Media Bridge>
% export SMB_API_KEY=<API key for Symphony Media Bridge API>
% npm start
```

The WHIP endpoint is now available at `http://localhost:8000/api/v2/whip/sfu-broadcaster` and you can use a WHIP compatible client to establish a media stream to the Symphony Media Bridge.

To try this out you can use the WHIP web client available [here](https://web.whip.eyevinn.technology/?endpoint=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fv2%2Fwhip%2Fsfu-broadcaster).

If you want to protect the WHIP endpoint with an API key you can add the environment variable `API_KEY` with the key you wish to require.

## Development

Start a local Symphony instance using a Docker image we provide for development and testing.

```
% docker run --rm \
  -e HTTP_PORT=8280 \
  -e UDP_PORT=12000 \
  -e API_KEY=dev \
  -e IPV4_ADDR=127.0.0.1 \
  -p 8280:8280 \
  -p 12000:12000/udp \
  eyevinntechnology/wrtc-sfu
```

```
% SMB_URL=http://localhost:8280 SMB_API_KEY=dev npm run dev
```

When a WHIP connection is established you can verify that with the following API call to the local SFU.

```
% curl -v -H 'X-APIKey: dev' http://localhost:8280/conferences/<conferenceId>/ingest
```

To list available conferences you can run the following curl command.

```
% curl -v -H 'X-APIKey: dev' http://localhost:8280/conferences/
```

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## License

This project is licensed under the MIT License, see [LICENSE](LICENSE).

# Support

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

# About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward we develop proof-of-concepts and tools. The things we learn and the code we write we share with the industry in [blogs](https://dev.to/video) and by open sourcing the code we have written.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
