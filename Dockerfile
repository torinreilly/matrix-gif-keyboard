from node:17

RUN mkdir -p /srv/app/gifsearch
WORKDIR /srv/app/gifsearch

COPY package.json /srv/app/gifsearch
COPY /package-lock.json srv/app/gifsearch

RUN apt-get update
RUN apt-get upgrade -y
RUN useradd -ms /bin/bash gif
RUN chmod -R 755 /srv/app/gifsearch
RUN chown -R gif:gif /srv/app/gifsearch

USER gif
ENV NODE_ENV production
RUN npm install

EXPOSE 3000
COPY . /srv/app/gifsearch

CMD ["node", "src/server.js"]